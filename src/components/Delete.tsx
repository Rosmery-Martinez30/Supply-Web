import { AlertTriangle, X } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  loading?: boolean;
}

const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Eliminar elemento?",
  message = "Esta acción no se puede deshacer.",
  itemName,
  loading = false
}: DeleteModalProps) => {
  
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
          {title}
        </h2>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-300 text-center mb-2">
          {message}
        </p>

        {/* Item name (if provided) */}
        {itemName && (
          <div className="bg-gray-50 dark:bg-neutral-700 rounded-lg p-3 mb-6">
            <p className="text-sm text-gray-700 dark:text-gray-200 text-center">
              <span className="font-semibold">"{itemName}"</span>
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Eliminando...</span>
              </>
            ) : (
              "Eliminar"
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DeleteModal;