'use client';

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect, useRouter, useParams } from "next/navigation";

type ListType = 'company' | 'people';

interface List {
  id: string;
  name: string;
  type: ListType;
  items: string[];
  createdAt: Date;
}

export default function ListDetailPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const listId = params.id as string;

  const [list, setList] = useState<List | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  // Load the specific list from localStorage
  useEffect(() => {
    const savedLists = localStorage.getItem('trackingLists');
    if (savedLists) {
      const parsedLists = JSON.parse(savedLists);
      const foundList = parsedLists.find((l: any) => l.id === listId);
      if (foundList) {
        setList({
          ...foundList,
          createdAt: new Date(foundList.createdAt)
        });
      }
    }
  }, [listId]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !list) return;

    setUploadStatus('uploading');

    // Simulate file parsing - in real app, you would parse CSV/Excel here
    setTimeout(() => {
      const mockItems = [
        `${list.type === 'company' ? 'Company' : 'Person'} ${Math.floor(Math.random() * 1000)}`,
        `${list.type === 'company' ? 'Company' : 'Person'} ${Math.floor(Math.random() * 1000)}`,
        `${list.type === 'company' ? 'Company' : 'Person'} ${Math.floor(Math.random() * 1000)}`,
        `${list.type === 'company' ? 'Company' : 'Person'} ${Math.floor(Math.random() * 1000)}`,
        `${list.type === 'company' ? 'Company' : 'Person'} ${Math.floor(Math.random() * 1000)}`,
      ];

      const updatedList = {
        ...list,
        items: [...list.items, ...mockItems]
      };

      // Update localStorage
      const savedLists = localStorage.getItem('trackingLists');
      if (savedLists) {
        const parsedLists = JSON.parse(savedLists);
        const updatedLists = parsedLists.map((l: any) =>
          l.id === listId ? updatedList : l
        );
        localStorage.setItem('trackingLists', JSON.stringify(updatedLists));
      }

      setList(updatedList);
      setUploadStatus('success');

      setTimeout(() => {
        setUploadStatus('idle');
        setSelectedFile(null);
      }, 2000);
    }, 1500);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
  };

  const removeItemFromList = (index: number) => {
    if (!list) return;

    const updatedItems = list.items.filter((_, i) => i !== index);
    const updatedList = { ...list, items: updatedItems };

    // Update localStorage
    const savedLists = localStorage.getItem('trackingLists');
    if (savedLists) {
      const parsedLists = JSON.parse(savedLists);
      const updatedLists = parsedLists.map((l: any) =>
        l.id === listId ? updatedList : l
      );
      localStorage.setItem('trackingLists', JSON.stringify(updatedLists));
    }

    setList(updatedList);
  };

  const startEditingItem = (index: number, value: string) => {
    setEditingItem(index);
    setEditValue(value);
  };

  const saveEditedItem = (index: number) => {
    if (!list || !editValue.trim()) return;

    const updatedItems = [...list.items];
    updatedItems[index] = editValue;
    const updatedList = { ...list, items: updatedItems };

    // Update localStorage
    const savedLists = localStorage.getItem('trackingLists');
    if (savedLists) {
      const parsedLists = JSON.parse(savedLists);
      const updatedLists = parsedLists.map((l: any) =>
        l.id === listId ? updatedList : l
      );
      localStorage.setItem('trackingLists', JSON.stringify(updatedLists));
    }

    setList(updatedList);
    setEditingItem(null);
    setEditValue('');
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditValue('');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-jungle-teal-950 via-muted-teal-900 to-frozen-water-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    redirect("/sign-in");
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-jungle-teal-950 via-muted-teal-900 to-frozen-water-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-4">❓</div>
          <h1 className="text-3xl font-bold text-white mb-4">List Not Found</h1>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gradient-to-r from-jungle-teal-600 to-muted-teal-600 hover:from-jungle-teal-700 hover:to-muted-teal-700 text-white font-semibold rounded-lg transition-all inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-jungle-teal-950 via-muted-teal-900 to-frozen-water-900">
      {/* Top Navigation */}
      <nav className="backdrop-blur-xl bg-jungle-teal-900/95 border-b border-jungle-teal-700/40">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white text-xl font-bold">
              Third Eye
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white">
              {user?.firstName || user?.emailAddresses[0].emailAddress}
            </span>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-muted-teal-50 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{list.name}</h1>
              <p className="text-muted-teal-50">
                {list.type === 'company' ? '🏢 Company List' : '👥 People List'} • {list.items.length} items
              </p>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
            list.type === 'company'
              ? 'bg-jungle-teal-500/20 text-jungle-teal-300 border border-jungle-teal-500/30'
              : 'bg-indigo-500/20 text-frozen-water-300 border border-frozen-water-500/30'
          }`}>
            {list.type === 'company' ? 'Company' : 'People'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="backdrop-blur-xl bg-jungle-teal-900/95 rounded-2xl border border-jungle-teal-700/40 p-6 h-fit">
            <h2 className="text-xl font-bold text-white mb-4">Upload Items</h2>

            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-jungle-teal-500 bg-purple-500/10'
                    : 'border-jungle-teal-700/40 bg-jungle-teal-800/90 hover:border-white/40 hover:bg-jungle-teal-700/90'
                }`}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".csv,.xlsx,.xls,.txt"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="pointer-events-none">
                  <div className="text-4xl mb-3">📤</div>
                  <p className="text-white font-semibold mb-1">
                    Drop your file here or click to browse
                  </p>
                  <p className="text-muted-teal-50 text-sm">
                    Supports CSV, Excel, or TXT files
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-jungle-teal-800/90 border border-jungle-teal-700/40 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-jungle-teal-600 to-muted-teal-600 rounded-lg flex items-center justify-center">
                      <span className="text-xl">📄</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{selectedFile.name}</p>
                      <p className="text-muted-teal-50 text-sm">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    disabled={uploadStatus === 'uploading'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {uploadStatus === 'success' && (
                  <div className="mb-4 p-3 bg-mint-cream-700/30 border border-mint-cream-600/50 rounded-lg">
                    <p className="text-mint-cream-400 flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Upload successful! {list.items.length > 0 && `${list.items.length} items added.`}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={uploadStatus === 'uploading'}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    uploadStatus !== 'uploading'
                      ? 'bg-gradient-to-r from-jungle-teal-600 to-muted-teal-600 hover:from-jungle-teal-700 hover:to-muted-teal-700 text-white'
                      : 'bg-jungle-teal-800/90 text-muted-teal-400 cursor-not-allowed'
                  }`}
                >
                  {uploadStatus === 'uploading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    'Upload to List'
                  )}
                </button>
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-xs flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>
                  Upload a CSV, Excel, or TXT file with one {list.type === 'company' ? 'company' : 'person'} per line.
                </span>
              </p>
            </div>
          </div>

          {/* List Items */}
          <div className="backdrop-blur-xl bg-jungle-teal-900/95 rounded-2xl border border-jungle-teal-700/40 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">List Items</h2>
              <span className="text-muted-teal-50 text-sm">{list.items.length} total</span>
            </div>

            {list.items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-muted-teal-50">No items yet. Upload a file to get started.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {list.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-jungle-teal-800/90 hover:bg-jungle-teal-700/90 rounded-lg transition-colors group"
                  >
                    {editingItem === index ? (
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-muted-teal-50 text-sm font-mono">
                          #{(index + 1).toString().padStart(3, '0')}
                        </span>
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-jungle-teal-900/90 border border-jungle-teal-700/30 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-jungle-teal-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditedItem(index);
                            if (e.key === 'Escape') cancelEditing();
                          }}
                        />
                        <button
                          onClick={() => saveEditedItem(index)}
                          className="text-mint-cream-400 hover:text-green-300 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-muted-teal-50 hover:text-white transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-muted-teal-50 text-sm font-mono">
                            #{(index + 1).toString().padStart(3, '0')}
                          </span>
                          <span className="text-white truncate">{item}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditingItem(index, item)}
                            className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                            title="Edit item"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => removeItemFromList(index)}
                            className="text-red-400 hover:text-red-300 transition-colors p-1"
                            title="Delete item"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
