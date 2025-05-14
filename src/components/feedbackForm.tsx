import React, { useState } from "react";

type MessageType = "bug" | "feedback";

interface Props {
  open: boolean;
  onClose: () => void;
}

const FeedbackForm: React.FC<Props> = ({ open, onClose }) => {
  const [messageType, setMessageType] = useState<MessageType>("bug");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const feedback = {
      user_id: "1", // 🔁 cambiar al user logeado
      message_type: messageType,
      message,
    };

    try {
      const response = await fetch("http://localhost:8000/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) throw new Error("Error al enviar feedback");
      alert("Enviado con éxito");
      onClose();
    } catch (error) {
      alert("Error al enviar feedback");
      console.error(error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-96"
      >
        <h2 className="text-lg font-bold mb-4">Enviar Feedback</h2>

        <label className="block mb-2">
          Tipo:
          <select
            value={messageType}
            onChange={(e) => setMessageType(e.target.value as MessageType)}
            className="block w-full mt-1 p-2 border border-gray-300 rounded"
          >
            <option value="bug">Bug</option>
            <option value="feedback">Feedback</option>
          </select>
        </label>

        <label className="block mb-2">
          Mensaje:
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="block w-full mt-1 p-2 border border-gray-300 rounded"
          />
        </label>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            className="bg-red-300 px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;