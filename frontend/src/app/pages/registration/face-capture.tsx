import { Link, useNavigate } from "react-router";
import { useState, useRef, useEffect } from "react";
import {
  Camera,
  Check,
  X,
  Upload,
  RefreshCw,
  Home,
  Sun,
  User,
  Eye,
} from "lucide-react";
import { registration } from "../../../lib/api";

export function FaceCapture() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [checks, setChecks] = useState({
    faceDetected: false,
    faceCentered: false,
    goodLighting: false,
    noObstructions: false,
    imageSharp: false,
    singleFace: false,
  });

  useEffect(() => {
    // Simulate checks passing after camera is active
    if (cameraActive && !capturedImage) {
      const timer = setTimeout(() => {
        setChecks({
          faceDetected: true,
          faceCentered: true,
          goodLighting: true,
          noObstructions: true,
          imageSharp: true,
          singleFace: true,
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [cameraActive, capturedImage]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      // Silently handle camera permission denial
      setCameraError(
        "Camera access denied. Please use the Upload button to select a photo instead."
      );
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);
        // Simulate all checks passing for uploaded images
        setChecks({
          faceDetected: true,
          faceCentered: true,
          goodLighting: true,
          noObstructions: true,
          imageSharp: true,
          singleFace: true,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageData);
        // Stop camera
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach((track) => track.stop());
        setCameraActive(false);
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setChecks({
      faceDetected: false,
      faceCentered: false,
      goodLighting: false,
      noObstructions: false,
      imageSharp: false,
      singleFace: false,
    });
    startCamera();
  };

  const confirmPhoto = async () => {
    if (!capturedImage) return;

    const guestId = sessionStorage.getItem("guestId");
    if (guestId) {
      try {
        const blob = await fetch(capturedImage).then((r) => r.blob());
        await registration.uploadFace(guestId, blob);
      } catch (err) {
        console.error("Face upload failed:", err);
      }
    }

    sessionStorage.setItem("faceImage", capturedImage);
    navigate("/register/review");
  };

  const allChecksPassed = Object.values(checks).every((v) => v === true);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Plus_Jakarta_Sans']">
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#0F172A]">
            <Home className="w-5 h-5" />
            <span className="font-bold">Home</span>
          </Link>
        </div>
      </header>

      {/* Progress Stepper */}
      <div className="bg-white border-b border-[#E2E8F0] py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center max-w-2xl mx-auto">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#34D399] text-white flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-[#34D399]">Profile</span>
              </div>
            </div>
            <div className="w-20 h-0.5 bg-[#34D399] mx-2"></div>
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#22D3EE] text-white flex items-center justify-center font-bold">
                  2
                </div>
                <span className="text-sm font-medium text-[#22D3EE]">
                  Face Capture
                </span>
              </div>
            </div>
            <div className="w-20 h-0.5 bg-[#E2E8F0] mx-2"></div>
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#E2E8F0] text-[#64748B] flex items-center justify-center font-bold">
                  3
                </div>
                <span className="text-sm font-medium text-[#64748B]">Review</span>
              </div>
            </div>
            <div className="w-20 h-0.5 bg-[#E2E8F0] mx-2"></div>
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#E2E8F0] text-[#64748B] flex items-center justify-center font-bold">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-[#64748B]">
                  Confirmed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-[#E2E8F0] rounded-[14px] p-8">
            <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
              Face Capture
            </h1>
            <p className="text-[#64748B] mb-8">
              Capture your photo for instant check-in at the event
            </p>

            {/* Instructions */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-4 mb-6">
              <h3 className="font-bold text-[#0F172A] mb-3">
                Tips for best results:
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-[#64748B]">
                  <Sun className="w-4 h-4 text-[#22D3EE]" />
                  <span>Good lighting</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#64748B]">
                  <User className="w-4 h-4 text-[#22D3EE]" />
                  <span>Face the camera</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#64748B]">
                  <Eye className="w-4 h-4 text-[#22D3EE]" />
                  <span>Remove sunglasses</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#64748B]">
                  <Camera className="w-4 h-4 text-[#22D3EE]" />
                  <span>Neutral expression</span>
                </div>
              </div>
            </div>

            {/* Camera Error Alert */}
            {cameraError && (
              <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-[14px] p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#DC2626] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#991B1B] mb-1">
                      Camera Access Denied
                    </p>
                    <p className="text-sm text-[#7F1D1D]">
                      {cameraError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Camera Area */}
            <div className="mb-6">
              <div
                className={`relative bg-[#0B0F1A] rounded-[14px] overflow-hidden aspect-video flex items-center justify-center ${
                  allChecksPassed && !capturedImage ? "border-4 border-[#34D399]" : "border-4 border-[#1E293B]"
                }`}
              >
                {!cameraActive && !capturedImage && (
                  <button
                    onClick={startCamera}
                    className="flex flex-col items-center gap-3 text-white"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center">
                      <Camera className="w-8 h-8" />
                    </div>
                    <span className="font-medium">Click to activate camera</span>
                  </button>
                )}

                {cameraActive && !capturedImage && (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {/* Face guide overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className={`w-64 h-80 border-2 border-dashed ${
                          allChecksPassed ? "border-[#34D399]" : "border-[#FB7185]"
                        } rounded-full opacity-50`}
                      ></div>
                    </div>
                  </>
                )}

                {capturedImage && (
                  <div className="relative w-full h-full">
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-[#34D399] text-white px-4 py-2 rounded-full font-medium flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Looking good!
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quality Checklist */}
            {cameraActive && !capturedImage && (
              <div className="mb-6 grid md:grid-cols-2 gap-3">
                {[
                  { key: "faceDetected", label: "Face detected" },
                  { key: "faceCentered", label: "Face centered" },
                  { key: "goodLighting", label: "Good lighting" },
                  { key: "noObstructions", label: "No obstructions" },
                  { key: "imageSharp", label: "Image sharp" },
                  { key: "singleFace", label: "Single face only" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center gap-2 text-sm"
                  >
                    {checks[item.key as keyof typeof checks] ? (
                      <Check className="w-4 h-4 text-[#34D399]" />
                    ) : (
                      <X className="w-4 h-4 text-[#FB7185]" />
                    )}
                    <span
                      className={
                        checks[item.key as keyof typeof checks]
                          ? "text-[#34D399]"
                          : "text-[#64748B]"
                      }
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              {!capturedImage ? (
                <>
                  <Link
                    to="/register/profile"
                    className="px-6 py-3 rounded-full border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] font-medium"
                  >
                    Back
                  </Link>
                  <button
                    onClick={capturePhoto}
                    disabled={!allChecksPassed}
                    className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Capture Photo
                  </button>
                  <button
                    className="px-6 py-3 rounded-full border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] font-medium flex items-center gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-5 h-5" />
                    Upload
                  </button>
                  <Link
                    to="/register/review"
                    className="px-6 py-3 rounded-full border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] font-medium"
                  >
                    Skip
                  </Link>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </>
              ) : (
                <>
                  <button
                    onClick={retake}
                    className="px-6 py-3 rounded-full border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] font-medium flex items-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Retake
                  </button>
                  <button
                    onClick={confirmPhoto}
                    className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white font-medium hover:opacity-90 flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Use This Photo
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}