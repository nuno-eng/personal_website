// Small fixes on finished videos, without the original edit project.
//
//   swift edit.swift cut  <in.mp4> <out.mov> <fromSeconds> <toSeconds>
//       Removes [from, to). Pick frame-exact points at a slide change so the jump is hidden.
//   swift edit.swift text <in.mp4> <out.mov> <fromSeconds> <toSeconds> <x> <yFromTop> <fontSize> "<text>"
//       Burns a line of text into the picture between two times, fading in over 0.4 s.
//
// Output is a high-quality intermediate; run transcode.swift on it for the web sizes.
import AVFoundation
import AppKit
import QuartzCore

let a = CommandLine.arguments
let mode = a[1], src = URL(fileURLWithPath: a[2]), dst = URL(fileURLWithPath: a[3])
let from = CMTime(seconds: Double(a[4])!, preferredTimescale: 30000)
let to = CMTime(seconds: Double(a[5])!, preferredTimescale: 30000)
try? FileManager.default.removeItem(at: dst)

let asset = AVURLAsset(url: src)
let sem = DispatchSemaphore(value: 0)
Task {
  do {
    let comp = AVMutableComposition()
    let duration = try await asset.load(.duration)
    for type in [AVMediaType.video, .audio] {
      guard let track = try await asset.loadTracks(withMediaType: type).first,
            let t = comp.addMutableTrack(withMediaType: type, preferredTrackID: kCMPersistentTrackID_Invalid) else { continue }
      try t.insertTimeRange(CMTimeRange(start: .zero, duration: duration), of: track, at: .zero)
      if type == .video { t.preferredTransform = try await track.load(.preferredTransform) }
    }
    if mode == "cut" { comp.removeTimeRange(CMTimeRange(start: from, end: to)) }

    let export = AVAssetExportSession(asset: comp, presetName: AVAssetExportPresetHighestQuality)!
    export.outputURL = dst
    export.outputFileType = .mov

    if mode == "text" {
      let vTrack = comp.tracks(withMediaType: .video).first!
      let size = vTrack.naturalSize
      let x = CGFloat(Double(a[6])!), yTop = CGFloat(Double(a[7])!), fontSize = CGFloat(Double(a[8])!)
      let text = a[9]

      let parent = CALayer(), video = CALayer()
      parent.frame = CGRect(origin: .zero, size: size); video.frame = parent.frame
      parent.addSublayer(video)
      // CATextLayer doesn't render in an export from the command line, so draw the text into an image.
      let attributed = NSAttributedString(string: text, attributes: [
        .font: NSFont(name: "HelveticaNeue-Medium", size: fontSize) ?? NSFont.systemFont(ofSize: fontSize, weight: .medium),
        .foregroundColor: NSColor(red: 0.29, green: 0.33, blue: 0.42, alpha: 1),
      ])
      let textSize = attributed.size()
      let w = Int(ceil(textSize.width)) + 4, h = Int(ceil(textSize.height)) + 4
      let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: w, pixelsHigh: h, bitsPerSample: 8, samplesPerPixel: 4,
                                    hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
      NSGraphicsContext.saveGraphicsState()
      NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
      attributed.draw(at: NSPoint(x: 2, y: 2))
      NSGraphicsContext.restoreGraphicsState()
      let label = CALayer()
      label.contents = bitmap.cgImage
      // Core Animation's origin is bottom-left; the caller gives y from the top.
      label.frame = CGRect(x: x, y: size.height - yTop - CGFloat(h), width: CGFloat(w), height: CGFloat(h))
      label.opacity = 0
      let total = comp.duration.seconds
      let s = from.seconds, e = to.seconds
      let fade = CAKeyframeAnimation(keyPath: "opacity")
      fade.values = [0, 0, 1, 1, 0, 0]
      fade.keyTimes = [0, s / total, (s + 0.4) / total, (e - 0.02) / total, e / total, 1].map { NSNumber(value: $0) }
      fade.beginTime = AVCoreAnimationBeginTimeAtZero
      fade.duration = total
      fade.isRemovedOnCompletion = false
      label.add(fade, forKey: "show")
      parent.addSublayer(label)

      let vc = AVMutableVideoComposition()
      vc.renderSize = size
      vc.frameDuration = CMTime(value: 1, timescale: 30)
      let instruction = AVMutableVideoCompositionInstruction()
      instruction.timeRange = CMTimeRange(start: .zero, duration: comp.duration)
      instruction.layerInstructions = [AVMutableVideoCompositionLayerInstruction(assetTrack: vTrack)]
      vc.instructions = [instruction]
      vc.animationTool = AVVideoCompositionCoreAnimationTool(postProcessingAsVideoLayer: video, in: parent)
      export.videoComposition = vc
    }

    await export.export()
    if export.status == .completed { print("ok", dst.lastPathComponent, String(format: "%.2fs", comp.duration.seconds)) }
    else { print("FAILED:", export.error ?? "unknown") }
  } catch { print("FAILED:", error) }
  sem.signal()
}
sem.wait()
