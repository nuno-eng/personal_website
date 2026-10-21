// Usage: layout <video> <step>  -> "t leftMean rightMean" per step (0-255)
import AVFoundation
let a = CommandLine.arguments
let asset = AVURLAsset(url: URL(fileURLWithPath: a[1]))
let gen = AVAssetImageGenerator(asset: asset)
gen.requestedTimeToleranceBefore = .zero; gen.requestedTimeToleranceAfter = .zero
gen.maximumSize = CGSize(width: 192, height: 108)
let dur = asset.duration.seconds, step = Double(a[2])!
var t = 0.0
while t < dur {
  if let img = try? gen.copyCGImage(at: CMTime(seconds: t, preferredTimescale: 600), actualTime: nil) {
    let ctx = CGContext(data: nil, width: 192, height: 108, bitsPerComponent: 8, bytesPerRow: 192 * 4, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    ctx.draw(img, in: CGRect(x: 0, y: 0, width: 192, height: 108))
    let p = ctx.data!.bindMemory(to: UInt8.self, capacity: 192 * 108 * 4)
    func mean(_ x0: Int, _ x1: Int) -> Int { var s = 0; for y in 0..<108 { for x in x0..<x1 { let i = (y * 192 + x) * 4; s += Int(p[i]) + Int(p[i+1]) + Int(p[i+2]) } }; return s / ((x1 - x0) * 108 * 3) }
    print(String(format: "%.2f %d %d", t, mean(0, 80), mean(112, 192)))
  }
  t += step
}
