import { useState } from "react";
import { Button, Box, Typography, Alert } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function ErrorTester() {
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const simulateError = async (url: string, label: string) => {
    setError("");
    try {
      const response = await fetch(url); // intencionalmente mal
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        let errorMessage = "";

        switch (response.status) {
          case 400:
            errorMessage = "error.solicitud_invalida";
            break;
          case 401:
            errorMessage = "error.no_autorizado";
            break;
          case 403:
            errorMessage = "error.sin_permisos";
            break;
          case 404:
            errorMessage = "error.recurso_no_ent encontrado";
            break;
          case 409:
            errorMessage = "error.usuario_ya_existe";
            break;
          case 500:
            errorMessage = "error.error_interno_servidor";
            break;
          default:
            errorMessage = "error.error_inesperado";
        }

        throw new Error(errorMessage);
      }
    } catch (err: any) {
      if (err instanceof TypeError || err.message === "Failed to fetch") {
        setError(t("error.no_conexion"));
      } else {
        setError(t(err.message) || t("error.error_desconocido"));
      }
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Test de errores simulados
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
        <Button variant="outlined" color="error" onClick={() => simulateError("/fake-unauthorized", "401")}>
          Simular 401
        </Button>
        <Button variant="outlined" color="error" onClick={() => simulateError("/fake-not-found", "404")}>
          Simular 404
        </Button>
        <Button variant="outlined" color="error" onClick={() => simulateError("/fake-conflict", "409")}>
          Simular 409
        </Button>
        <Button variant="outlined" color="error" onClick={() => simulateError("/fake-server-error", "500")}>
          Simular 500
        </Button>
        <Button variant="outlined" color="error" onClick={() => simulateError("http://localhost:1234", "offline")}>
          Simular sin conexión
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
