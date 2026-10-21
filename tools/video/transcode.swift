// Usage: swift transcode.swift <in.mp4> <out.mp4> <height> <videoBitsPerSecond> [secondsLimit]
// H.264 High + AAC 128k, fast start (moov first) so the browser can play while downloading.
import AVFoundation

let a = CommandLine.arguments
let src = URL(fileURLWithPath: a[1]), dst = URL(fileURLWithPath: a[2])
let height = Int(a[3])!, vbr = Int(a[4])!
let limit = a.count > 5 ? Double(a[5])! : nil
try? FileManager.default.removeItem(at: dst)

let asset = AVURLAsset(url: src)
let sem = DispatchSemaphore(value: 0)
Task {
  do {
    let vTrack = try await asset.loadTracks(withMediaType: .video).first!
    let aTrack = try await asset.loadTracks(withMediaType: .audio).first
    let natural = try await vTrack.load(.naturalSize)
    let fps = try await vTrack.load(.nominalFrameRate)
    let width = Int((Double(natural.width) * Double(height) / Double(natural.height)).rounded() / 2) * 2

    let reader = try AVAssetReader(asset: asset)
    if let limit { reader.timeRange = CMTimeRange(start: .zero, duration: CMTime(seconds: limit, preferredTimescale: 600)) }
    let vOut = AVAssetReaderTrackOutput(track: vTrack, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange])
    reader.add(vOut)
    var aOut: AVAssetReaderTrackOutput?
    if let aTrack {
      let o = AVAssetReaderTrackOutput(track: aTrack, outputSettings: [AVFormatIDKey: kAudioFormatLinearPCM])
      reader.add(o); aOut = o
    }

    let writer = try AVAssetWriter(outputURL: dst, fileType: .mp4)
    writer.shouldOptimizeForNetworkUse = true
    let vIn = AVAssetWriterInput(mediaType: .video, outputSettings: [
      AVVideoCodecKey: AVVideoCodecType.h264,
      AVVideoWidthKey: width, AVVideoHeightKey: height,
      AVVideoScalingModeKey: AVVideoScalingModeResizeAspectFill,
      AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: vbr,
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
        AVVideoMaxKeyFrameIntervalKey: Int((fps > 0 ? fps : 30) * 2),
        AVVideoAllowFrameReorderingKey: true,
      ],
    ])
    vIn.expectsMediaDataInRealTime = false
    writer.add(vIn)
    var aIn: AVAssetWriterInput?
    if aOut != nil {
      let i = AVAssetWriterInput(mediaType: .audio, outputSettings: [AVFormatIDKey: kAudioFormatMPEG4AAC, AVSampleRateKey: 48000, AVNumberOfChannelsKey: 2, AVEncoderBitRateKey: 128_000])
      writer.add(i); aIn = i
    }
    reader.startReading(); writer.startWriting(); writer.startSession(atSourceTime: .zero)

    let group = DispatchGroup()
    func pump(_ input: AVAssetWriterInput, _ output: AVAssetReaderTrackOutput, _ q: String) {
      group.enter()
      input.requestMediaDataWhenReady(on: DispatchQueue(label: q)) {
        while input.isReadyForMoreMediaData {
          if let s = output.copyNextSampleBuffer() { input.append(s) } else { input.markAsFinished(); group.leave(); return }
        }
      }
    }
    pump(vIn, vOut, "v")
    if let aIn, let aOut { pump(aIn, aOut, "a") }
    group.wait()
    await writer.finishWriting()
    if writer.status != .completed { print("FAILED:", writer.error ?? "unknown") } else { print("ok \(width)x\(height)") }
  } catch { print("FAILED:", error) }
  sem.signal()
}
sem.wait()
