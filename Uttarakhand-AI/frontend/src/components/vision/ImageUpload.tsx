import React, { useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { analyzeImage } from '../../services/api';
import { fileToBase64, validateImageFile } from '../../utils/helpers';
import PlaceInfo from './PlaceInfo';
import type { Language } from '../../types';
import type { VisionAnalysisResponse } from '../../types/place';

interface ImageUploadProps {
  language: Language;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ language }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VisionAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setError(null);
    setAnalysisResult(null);

    try {
      // Convert to base64 and show preview
      const base64 = await fileToBase64(file);
      setSelectedImage(base64);
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error(err);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage || isAnalyzing) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeImage(selectedImage, language);
      setAnalysisResult(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to analyze image. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setError(null);
    setAnalysisResult(null);

    try {
      const base64 = await fileToBase64(file);
      setSelectedImage(base64);
    } catch (err) {
      setError('Failed to process image. Please try again.');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-block p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 shadow-lg">
          <ImageIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Place Recognition</h2>
        <p className="text-gray-600">Upload an image to identify places in Uttarakhand</p>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          selectedImage
            ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50'
            : 'border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50 hover:border-green-500 hover:from-green-50 hover:to-emerald-50'
        }`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 rounded-2xl overflow-hidden">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {selectedImage ? (
          <div className="space-y-6 relative z-10">
            <div className="relative inline-block group">
              <img
                src={selectedImage}
                alt="Selected"
                className="max-h-80 rounded-2xl shadow-2xl border-4 border-white"
              />
              <button
                onClick={handleClear}
                className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5" />
                    <span>Analyze Image</span>
                  </>
                )}
              </button>
              <button
                onClick={handleClear}
                className="px-8 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl border-2 border-gray-300 transform hover:-translate-y-0.5 font-semibold"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10">
            <div className="inline-block p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6 shadow-xl">
              <Upload className="w-16 h-16 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-3">
              Upload Your Image
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Drag and drop an image here, or click to browse
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
            >
              Select Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <span className="text-green-600">✓</span> JPG, PNG, WEBP
              </span>
              <span className="flex items-center gap-1">
                <span className="text-green-600">✓</span> Max 16MB
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Analysis Result */}
      {analysisResult && (
        <PlaceInfo
          result={analysisResult}
          imageUrl={selectedImage || undefined}
        />
      )}
    </div>
  );
};

export default ImageUpload;

