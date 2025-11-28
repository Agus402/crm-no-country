import React from "react";


// Este componente es un modal de confirmación reutilizable.
// Se puede usar en cualquier situación donde el usuario deba confirmar una acción.
// Recibe un mensaje personalizado y callbacks para aceptar o cancelar,
// permitiendo adaptarlo a distintos escenarios dentro de la aplicación.



interface Props {
  open: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<Props> = ({
  open,
  title,
  message,
  onCancel,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-999">
      <div className="bg-white rounded-xl w-80 p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-center mb-2">{title}</h2>
        <p className="text-sm text-gray-600 text-center mb-4">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
          >
            delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
