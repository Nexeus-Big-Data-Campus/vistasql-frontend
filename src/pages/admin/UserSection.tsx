import { useEffect, useState } from "react";
import { AppBar,
  Toolbar,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Select,
  SelectChangeEvent,
  Box,
  FormControl,
  InputLabel,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PaginationControls from "../../components/PaginationControls";
import React from "react";

const USERS_PER_PAGE = 20;

interface Usertype {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function UsersSection() {
  const [users, setUsers] = useState<Usertype[]>([]);
  const [page, setPage] = useState(1);

  // Inicialización de usuarios
  useEffect(() => {
    const stored = localStorage.getItem("users");
    if (stored) {
      setUsers(JSON.parse(stored));
    } else {
      const generatedUsers = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Usuario ${i + 1}`,
        email: `usuario${i + 1}@ejemplo.com`,
        role: i === 0 ? "admin" : "user",
      }));
      localStorage.setItem("users", JSON.stringify(generatedUsers));
      setUsers(generatedUsers);
    }
  }, []);

  type Role = "admin" | "user";
  const ROLE_LABELS: Record<Role, string> = {
    admin: "Administrador",
    user: "Usuario",
  };

  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const startIndex = (page - 1) * USERS_PER_PAGE;
  const paginatedUsers = users.slice(startIndex, startIndex + USERS_PER_PAGE);
  const [open, setOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<Usertype | null>(null);
  const [role, setRole] = React.useState<Role>("user");

  const handleDelete = (id: number) => {
    const deleteUsers = users.filter((user) => user.id !== id);
    setUsers(deleteUsers);
    localStorage.setItem("users", JSON.stringify(deleteUsers));
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
  <>
    <AppBar position="static" sx={{ bgcolor: "#d3d3d3", boxShadow: "none", mb: 2 }}>
      <Toolbar>
        <Typography variant="subtitle1" component="div">
          USERS
        </Typography>
      </Toolbar>
    </AppBar>    
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Gestión de usuarios
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow
                key={user.id}
                sx={{
                  backgroundColor:
                    user.role === "admin" ? "#f0f0f0" : "inherit",
                }}
              >
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{ROLE_LABELS[user.role as Role]}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      color="primary"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => {
                        setSelectedUser(user);
                        setRole(user.role as Role);
                        setOpen(true);
                      }}
                    >
                      Editar
                    </Button>

                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(user.id)}
                      disabled={user.role === "admin"}
                    >
                      Eliminar
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <Dialog open={open} onClose={handleClose}>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const updatedUser = {
                  ...selectedUser!,
                  name: formData.get("name") as string,
                  email: formData.get("email") as string,
                  role: role,
                };
                // Actualiza el usuario en el array
                const updatedUsers = users.map((u) =>
                  u.id === updatedUser.id ? updatedUser : u
                );
                setUsers(updatedUsers);
                localStorage.setItem("users", JSON.stringify(updatedUsers));
                handleClose();
              }}
            >
              <DialogTitle>
                {selectedUser
                  ? `Editar datos de ${selectedUser.name}`
                  : "Editar usuario"}
              </DialogTitle>
              <DialogContent>
                <TextField
                  margin="dense"
                  label="Nombre"
                  name="name"
                  fullWidth
                  defaultValue={selectedUser?.name}
                />
                <TextField
                  margin="dense"
                  label="Email"
                  name="email"
                  type="email"
                  fullWidth
                  defaultValue={selectedUser?.email}
                />
                <FormControl fullWidth margin="dense">
                  <InputLabel id="role-label">Rol</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
                    name="role"
                    value={role}
                    label="Rol"
                    onChange={(e) => setRole(e.target.value as Role)}
                  >
                    <MenuItem value="admin">Administrador</MenuItem>
                    <MenuItem value="user">Usuario</MenuItem>
                  </Select>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit">Guardar</Button>
              </DialogActions>
            </form>
          </Dialog>
        </Table>
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </CardContent>
    </Card>
  </>  
  );
}
