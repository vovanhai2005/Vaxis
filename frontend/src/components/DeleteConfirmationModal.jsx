import React from 'react';
import { X, Loader2, Trash2, AlertTriangle } from 'lucide-react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      ></div>

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100">
          
          {/* Header */}
          <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-between items-center border-b border-gray-100">
            <h3 className="text-lg font-semibold leading-6 text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirm Deletion
            </h3>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-500 focus:outline-none disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 py-6 sm:px-6">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete <span className="font-bold text-gray-900">{itemName || "this item"}</span>? 
              </p>
              <p className="mt-2 text-sm text-red-500 font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                This action cannot be undone. All data associated with this employee will be permanently removed.
              </p>
            </div>
          </div>

          {/* Footer - Buttons */}
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-100 rounded-b-2xl">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-xl border border-transparent bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-red-900/20 transition-all hover:bg-red-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-70 disabled:hover:scale-100 sm:ml-3 sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5 mr-2" />
                  Yes, Delete
                </>
              )}
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;