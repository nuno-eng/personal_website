// Usage: frame <video> <seconds> <out.jpg> [maxWidth]
import AVFoundation
import AppKit
let a = CommandLine.arguments
let asset = AVURLAsset(url: URL(fileURLWithPath: a[1]))
let gen = AVAssetImageGenerator(asset: asset)
gen.appliesPreferredTrackTransform = true
gen.requestedTimeToleranceBefore = .zero; gen.requestedTimeToleranceAfter = .zero
if a.count > 4 { gen.maximumSize = CGSize(width: Double(a[4])!, height: 10000) }
let img = try! gen.copyCGImage(at: CMTime(seconds: Double(a[2])!, preferredTimescale: 600), actualTime: nil)
let rep = NSBitmapImageRep(cgImage: img)
try! rep.representation(using: .jpeg, properties: [.compressionFactor: 0.85])!.write(to: URL(fileURLWithPath: a[3]))
