import React, { useState } from 'react';
import { ScanLine, Search, Loader2, Camera } from 'lucide-react';
import { CameraScanner } from './CameraScanner';

export function BarcodeScanner({ onScan, loading }) {
    const [barcode, setBarcode] = useState('');
    const [showCamera, setShowCamera] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (barcode.trim()) {
            onScan(barcode);
        }
    };

    const handleCameraScan = (scannedBarcode) => {
        setBarcode(scannedBarcode);
        setShowCamera(false);
        onScan(scannedBarcode);
    };

    return (
        <>
            <div className="w-full text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow relative">
                    <div className="absolute inset-0 rounded-full border border-primary/30 animate-ping opacity-20"></div>
                    <ScanLine className="w-8 h-8 text-primary" />
                </div>

                <h2 className="text-2xl font-bold text-[var(--text-main)] mb-2 font-heading">Scan Product</h2>
                <p className="text-[var(--text-secondary)] mb-6 text-sm">Use camera or enter barcode manually</p>

                {/* Camera Scan Button */}
                <button
                    onClick={() => setShowCamera(true)}
                    className="w-full mb-4 bg-gradient-to-r from-primary to-emerald-500 hover:from-emerald-400 hover:to-primary text-black font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                    <Camera className="w-5 h-5" />
                    Scan with Camera
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-[var(--glass-border)]"></div>
                    <span className="text-xs text-[var(--text-secondary)] uppercase font-bold">Or</span>
                    <div className="flex-1 h-px bg-[var(--glass-border)]"></div>
                </div>

                <form onSubmit={handleSubmit} className="relative group w-full">
                    <input
                        type="text"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        placeholder="Enter Barcode ID"
                        className="relative w-full py-4 px-4 rounded-xl bg-[var(--background)] border border-[var(--glass-border)] text-[var(--text-main)] placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-lg font-mono tracking-widest text-center mb-4"
                        autoFocus={false}
                    />

                    <button
                        type="submit"
                        disabled={loading || !barcode}
                        className="w-full bg-[var(--card-bg)] hover:bg-primary/10 border border-[var(--glass-border)] text-[var(--text-main)] font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                Analyze Product
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--glass-border)] text-left">
                    <p className="text-xs text-[var(--text-secondary)] mb-2 font-bold uppercase">Quick Test Products:</p>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setBarcode('3017624010701')} className="px-3 py-1.5 bg-primary/5 text-xs text-[var(--text-secondary)] rounded-lg hover:text-primary transition-all">🍫 Nutella</button>
                        <button onClick={() => setBarcode('5449000000996')} className="px-3 py-1.5 bg-primary/5 text-xs text-[var(--text-secondary)] rounded-lg hover:text-primary transition-all">🥤 Coca-Cola</button>
                        <button onClick={() => setBarcode('5000159461122')} className="px-3 py-1.5 bg-primary/5 text-xs text-[var(--text-secondary)] rounded-lg hover:text-primary transition-all">🍫 Snickers</button>
                        <button onClick={() => setBarcode('5053990155354')} className="px-3 py-1.5 bg-primary/5 text-xs text-[var(--text-secondary)] rounded-lg hover:text-primary transition-all">🥔 Pringles</button>
                        <button onClick={() => setBarcode('7622210449283')} className="px-3 py-1.5 bg-primary/5 text-xs text-[var(--text-secondary)] rounded-lg hover:text-primary transition-all">🍫 Toblerone</button>
                        <button onClick={() => setBarcode('5449000000439')} className="px-3 py-1.5 bg-[var(--background)]/10 text-xs text-[var(--text-secondary)] rounded-lg hover:bg-primary/10 hover:text-primary transition-all">🥤 Sprite</button>
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)] opacity-50 mt-2">Or enter any barcode from <a href="https://world.openfoodfacts.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenFoodFacts</a></p>
                </div>
            </div>

            {/* Camera Scanner Modal */}
            {showCamera && (
                <CameraScanner
                    onScan={handleCameraScan}
                    onClose={() => setShowCamera(false)}
                />
            )}
        </>
    );
}
