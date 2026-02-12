import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Zap } from 'lucide-react';

export function CameraScanner({ onScan, onClose }) {
    const scannerRef = useRef(null);
    const [scanner, setScanner] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState(null);

    useEffect(() => {
        // Get available cameras
        Html5Qrcode.getCameras()
            .then(devices => {
                if (devices && devices.length > 0) {
                    setCameras(devices);
                    // Prefer back camera on mobile
                    const backCamera = devices.find(d => d.label.toLowerCase().includes('back')) || devices[0];
                    setSelectedCamera(backCamera.id);
                } else {
                    setError('No cameras found on this device');
                }
            })
            .catch(err => {
                console.error('Error getting cameras:', err);
                setError('Unable to access camera. Please grant camera permissions.');
            });

        return () => {
            // Cleanup on unmount
            if (scanner) {
                scanner.stop().catch(err => console.error('Error stopping scanner:', err));
            }
        };
    }, []);

    useEffect(() => {
        if (selectedCamera && !isScanning) {
            startScanning();
        }
    }, [selectedCamera]);

    const startScanning = async () => {
        try {
            const html5QrCode = new Html5Qrcode("qr-reader");
            setScanner(html5QrCode);

            await html5QrCode.start(
                selectedCamera,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                (decodedText, decodedResult) => {
                    // Success callback
                    console.log(`Barcode detected: ${decodedText}`);
                    onScan(decodedText);
                    stopScanning();
                },
                (errorMessage) => {
                    // Error callback (called continuously, so we don't show errors)
                }
            );

            setIsScanning(true);
            setError(null);
        } catch (err) {
            console.error('Error starting scanner:', err);
            setError('Failed to start camera. Please check permissions.');
        }
    };

    const stopScanning = async () => {
        if (scanner) {
            try {
                await scanner.stop();
                setIsScanning(false);
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
        }
    };

    const handleClose = async () => {
        await stopScanning();
        onClose();
    };

    const switchCamera = () => {
        if (cameras.length > 1) {
            const currentIndex = cameras.findIndex(c => c.id === selectedCamera);
            const nextIndex = (currentIndex + 1) % cameras.length;
            stopScanning().then(() => {
                setSelectedCamera(cameras[nextIndex].id);
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header */}
            <div className="flex-none flex items-center justify-between p-4 bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold text-white">Scan Barcode</h2>
                </div>
                <button
                    onClick={handleClose}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                >
                    <X className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Scanner Area */}
            <div className="flex-1 relative flex items-center justify-center bg-black">
                {error ? (
                    <div className="text-center px-6">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                            <X className="w-8 h-8 text-red-500" />
                        </div>
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            onClick={handleClose}
                            className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <div className="relative w-full max-w-md">
                        {/* Scanner Container */}
                        <div id="qr-reader" className="rounded-2xl overflow-hidden"></div>

                        {/* Scanning Indicator */}
                        {isScanning && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
                                <Zap className="w-4 h-4 text-black" />
                                <span className="text-sm font-bold text-black">Scanning...</span>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="mt-6 text-center px-6">
                            <p className="text-gray-400 text-sm">
                                Position the barcode within the frame
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Controls */}
            {!error && cameras.length > 1 && (
                <div className="flex-none p-4 bg-black/80 backdrop-blur-md border-t border-white/10">
                    <button
                        onClick={switchCamera}
                        className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <Camera className="w-5 h-5" />
                        Switch Camera
                    </button>
                </div>
            )}
        </div>
    );
}
