'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from './ui/Button';
import { Issue, IssueStatus, UserRole, User } from '../types';
import { ArrowLeft, Camera, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface IssueFormProps {
    issueId?: string; // If present, it's edit mode
}

export const IssueForm: React.FC<IssueFormProps> = ({ issueId }) => {
    const { user, token, role } = useAuthStore();
    const router = useRouter(); // Use Next.js router
    const [formData, setFormData] = useState<Partial<Issue>>({
        title: '',
        description: '',
        status: IssueStatus.OPEN,
        assignedTo: null,
        image: undefined
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    const isEdit = !!issueId;

    useEffect(() => {
        const init = async () => {
            if (!token) return;
            const u = await db.getAllUsers(token);
            setUsers(u);

            if (isEdit && issueId) {
                const existing = await db.getIssueById(issueId, token);
                if (existing) {
                    setFormData(existing);
                    if (existing.image) {
                        setImagePreview(existing.image);
                    }
                }
            }
        };
        init();
    }, [isEdit, issueId, token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !user || !token) return;
        setLoading(true);

        try {
            if (isEdit && issueId) {
                // Strip read-only fields
                const { id, createdBy, createdAt, updatedAt, ...updateData } = formData as Issue;
                await db.updateIssue(issueId, updateData, token);
                router.push(`/issues/${issueId}`);
            } else {
                const created = await db.createIssue({
                    title: formData.title,
                    description: formData.description,
                    status: formData.status || IssueStatus.OPEN,
                    assignedTo: formData.assignedTo || null,
                    image: formData.image,
                    createdBy: user.id
                }, token);
                router.push(`/issues/${created.id}`);
            }
        } catch (e: any) {
            console.error(e);
            alert(`Operation failed: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log('File selected:', file.name, file.type, file.size);
            try {
                resizeImage(file, (result) => {
                    console.log('Image resized successfully');
                    setImagePreview(result);
                    setFormData({ ...formData, image: result });
                });
            } catch (error) {
                console.error('Error processing image:', error);
                alert('Failed to process image. Please try a different image.');
            }
        } else {
            console.log('No file selected');
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        setFormData({ ...formData, image: undefined });
        // Reset file input
        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };


    const resizeImage = (file: File, callback: (result: string) => void) => {
        console.log('Starting image resize...');
        const reader = new FileReader();

        reader.onerror = (error) => {
            console.error('FileReader error:', error);
            alert('Failed to read image file. Please try again.');
        };

        reader.onload = (event) => {
            console.log('File read successfully, creating image...');
            const img = new Image();

            img.onerror = (error) => {
                console.error('Image load error:', error);
                alert('Failed to load image. Please try a different image.');
            };

            img.onload = () => {
                try {
                    console.log('Image loaded, resizing...', img.width, 'x', img.height);
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        throw new Error('Failed to get canvas context');
                    }
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    console.log('Image resized successfully, size:', Math.round(dataUrl.length / 1024), 'KB');
                    callback(dataUrl);
                } catch (error) {
                    console.error('Resize error:', error);
                    alert('Failed to resize image. Please try a smaller image.');
                }
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };



    // RBAC for assignment
    const canAssign = role === 'admin';

    return (
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
            <Button variant="ghost" className="pl-0 hover:bg-transparent -ml-2 sm:ml-0" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>

            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-100">{isEdit ? 'Edit Issue' : 'Create New Issue'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-[var(--bg-card)] backdrop-blur-md p-4 sm:p-6 rounded-lg border border-[var(--border-card)] shadow-sm text-[var(--text-primary)]">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Title</label>
                    <input
                        type="text"
                        required
                        className="w-full rounded-md border border-[var(--border-card)] p-2 bg-[var(--bg-header)] text-[var(--text-primary)] focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-[var(--text-muted)]"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        maxLength={120}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Description</label>
                    <textarea
                        required
                        rows={4}
                        className="w-full rounded-md border border-[var(--border-card)] p-2 bg-[var(--bg-header)] text-[var(--text-primary)] focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-[var(--text-muted)]"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Attachment</label>
                    <div className="flex flex-col gap-3">
                        {!imagePreview ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="image-upload"
                                    onChange={handleImageChange}
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                    className="flex items-center gap-2"
                                >
                                    <Camera className="h-4 w-4" />
                                    Upload Image
                                </Button>
                                <span className="text-xs text-slate-400">Supported: JPG, PNG</span>
                            </div>
                        ) : (
                            <div className="relative w-fit">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="max-h-60 rounded-md border border-[var(--border-card)]"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transform transition-transform hover:scale-110"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">Status</label>
                        <select
                            className="w-full rounded-md border border-white/20 p-2 bg-[#1F2022] text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value as IssueStatus })}
                        >
                            <option value={IssueStatus.OPEN}>Open</option>
                            <option value={IssueStatus.IN_PROGRESS}>In Progress</option>
                            <option value={IssueStatus.CLOSED}>Closed</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">Assigned To</label>
                        <select
                            disabled={!canAssign}
                            className="w-full rounded-md border border-white/20 p-2 bg-[#1F2022] text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:bg-[#1F2022]/50 disabled:text-slate-500"
                            value={formData.assignedTo || ''}
                            onChange={e => setFormData({ ...formData, assignedTo: e.target.value || null })}
                        >
                            <option value="">Unassigned</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.displayName || u.email || 'Unknown User'} ({u.role})
                                </option>
                            ))}
                        </select>
                        {!canAssign && <p className="text-xs text-slate-400">Only Admins can assign users.</p>}
                    </div>
                </div>

                <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
                    <Button type="button" variant="secondary" className="text-red-500 border-red-200 hover:bg-red-50 w-full sm:w-auto" onClick={async () => {
                        if (!token) return;
                        try {
                            setLoading(true);
                            await db.fixSchema(token);
                            alert('System repaired! Please try creating the issue again.');
                        } catch (e: any) {
                            alert(`Repair failed: ${e.message}`);
                        } finally {
                            setLoading(false);
                        }
                    }}>
                        Repair System
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => router.push('/issues')} className="w-full sm:w-auto">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                        {loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Issue')}
                    </Button>
                </div>
            </form>
        </div>
    );
};
