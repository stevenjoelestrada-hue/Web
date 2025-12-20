import React from 'react';
import FileCard from './FileCard';

const FileList = ({ files, folders, onDelete, onRestore, onPermanentDelete, onRename, onMove, onMoveToFolder, onShare, onPreview }) => {
    if (files.length === 0) {
        return (
            <div className="empty-state">
                <p>No se encontraron archivos. ¡Sube uno para empezar!</p>
            </div>
        );
    }

    return (
        <div className="file-grid">
            {files.map((file) => (
                <FileCard
                    key={file.id}
                    file={file}
                    folders={folders}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onPermanentDelete={onPermanentDelete}
                    onRename={onRename}
                    onMove={onMove}
                    onMoveToFolder={onMoveToFolder}
                    onShare={onShare}
                    onPreview={onPreview}
                />
            ))}
        </div>
    );
};

export default FileList;
