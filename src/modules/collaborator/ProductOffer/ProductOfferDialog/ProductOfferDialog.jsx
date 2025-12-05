
import React, { useState } from "react";
import api from "../../../../service/axiosConfig";
import { toast } from 'react-toastify';
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import "./ProductOfferDialog.css";

const API_URL = import.meta.env.VITE_API_URL_BACKEND; //Variable de entorno para la URL del backend.

const ProductOfferDialog = ({ open, onClose, userId, editData }) => {
    const categories = ["Hogar", "Juguetes", "Libros", "Ropa", "Tecnología", "Deportes", "Entretenimiento"];
    const [form, setForm] = useState({
        title: "",
        description: "",
        specs: "",
        category: "",
        amount: 1,
        priceOriginal: "",
        discount: "",
        img1: null,
        img2: null,
        img3: null,
    });
    const [preview1, setPreview1] = useState(null);
    const [preview2, setPreview2] = useState(null);
    const [preview3, setPreview3] = useState(null);
    const [errors, setErrors] = useState({});
    // Cargar datos al abrir en modo edición
    React.useEffect(() => {
        if (open) {
            if (editData) {
                setForm({
                    title: editData.title || "",
                    description: editData.description || "",
                    specs: editData.specs || "",
                    category: editData.category || "",
                    amount: editData.amount || 1,
                    priceOriginal: editData.priceOriginal || "",
                    discount: editData.discount || "",
                    img1: null,
                    img2: null,
                    img3: null,
                });
                // Previsualización de imágenes existentes
                setPreview1(editData.img1 ? `${API_URL}${editData.img1}` : null);
                setPreview2(editData.img2 ? `${API_URL}${editData.img2}` : null);
                setPreview3(editData.img3 ? `${API_URL}${editData.img3}` : null);
            } else {
                setForm({
                    title: "",
                    description: "",
                    specs: "",
                    category: "",
                    amount: 1,
                    priceOriginal: "",
                    discount: "",
                    img1: null,
                    img2: null,
                    img3: null,
                });
                setPreview1(null);
                setPreview2(null);
                setPreview3(null);
            }
            setErrors({});
        }
    }, [open, editData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e, imgKey, setPreview) => {
        const file = e.target.files && e.target.files[0];
        setForm(prev => ({ ...prev, [imgKey]: file }));
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (!form.title) newErrors.title = "Este campo es obligatorio";
        if (!form.description) newErrors.description = "Este campo es obligatorio";
        if (!form.specs) newErrors.specs = "Este campo es obligatorio";
        if (!form.category) newErrors.category = "Este campo es obligatorio";
        if (!form.amount || form.amount < 1) newErrors.amount = "Debe ser mayor a 0";
        if (!form.priceOriginal) newErrors.priceOriginal = "Este campo es obligatorio";
        if (form.discount === "" || form.discount === null) {
            newErrors.discount = "Este campo es obligatorio";
        } else if (isNaN(form.discount) || Number(form.discount) < 0) {
            newErrors.discount = "Debe ser un número positivo";
        } else if (Number(form.discount) > 100) {
            newErrors.discount = "El descuento no puede ser mayor a 100";
        }
        // Solo exigir imagen 1 si no hay previsualización (editData sin img1 y no se subió nueva)
        if (!form.img1 && !preview1) newErrors.img1 = "La imagen 1 es obligatoria";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            toast.error("Te faltan campos por llenar.", {position: "top-center"});
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("idUser", userId);
            formData.append("title", form.title);
            formData.append("description", form.description);
            formData.append("specs", form.specs);
            formData.append("category", form.category);
            formData.append("amount", form.amount);
            formData.append("priceOriginal", form.priceOriginal);
            formData.append("discount", form.discount);
            if (form.img1) formData.append("img1", form.img1);
            if (form.img2) formData.append("img2", form.img2);
            if (form.img3) formData.append("img3", form.img3);
            if (editData && editData.id) {
                // Editar oferta existente
                await api.put(`/product-offer/${editData.id}`, formData);
                toast.success("¡Oferta actualizada exitosamente!", {position: "top-center"});
            } else {
                // Crear nueva oferta
                await api.post("/product-offer", formData);
                toast.success("¡Oferta creada exitosamente!", {position: "top-center"});
            }
            setTimeout(() => {
                if (onClose) onClose();
                window.location.reload();
            }, 1500);
        } catch (error) {
            toast.error("Error al guardar la oferta", {position: "top-center"});
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle style={{textAlign:"center",fontSize:"25px" ,fontFamily:"Outfit"}}>
                {editData ? "Editar oferta" : "Agregar oferta"}
            </DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit} className="product-offer-form">
                    <TextField
                        label="Nombre del producto"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                        error={!!errors.title}
                        helperText={errors.title}
                    />
                    <TextField
                        label="Descripción"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        minRows={2}
                        required
                        margin="normal"
                        error={!!errors.description}
                        helperText={errors.description}
                    />
                    <TextField
                        label="Especificaciones"
                        name="specs"
                        value={form.specs}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        minRows={2}
                        required
                        margin="normal"
                        error={!!errors.specs}
                        helperText={errors.specs}
                    />
                    <FormControl fullWidth margin="normal" error={!!errors.category}>
                        <InputLabel id="category-label">Categoría</InputLabel>
                        <Select
                            labelId="category-label"
                            name="category"
                            value={form.category}
                            label="Categoría"
                            onChange={handleChange}
                            required
                        >
                            <MenuItem value=""><em>Selecciona una categoría</em></MenuItem>
                            {categories.map(cat => (
                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                            ))}
                        </Select>
                        {errors.category && <Typography variant="caption" color="error">{errors.category}</Typography>}
                    </FormControl>
                    <TextField
                        label="Cantidad"
                        name="amount"
                        type="number"
                        value={form.amount}
                        onChange={handleChange}
                        fullWidth
                        inputProps={{ min: 1 }}
                        required
                        margin="normal"
                        error={!!errors.amount}
                        helperText={errors.amount}
                    />
                    <TextField
                        label="Precio original"
                        name="priceOriginal"
                        type="number"
                        value={form.priceOriginal}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                        error={!!errors.priceOriginal}
                        helperText={errors.priceOriginal}
                    />
                    <TextField
                        label="Descuento (%)"
                        name="discount"
                        type="number"
                        value={form.discount}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                        error={!!errors.discount}
                        helperText={errors.discount}
                        inputProps={{ min: 0, max: 100 }}
                    />
                    <div className="img-upload-group">
                        <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
                            {preview1 && <img src={preview1} alt="Previsualización 1" className="img-preview" style={{maxWidth:'150px',maxHeight:'150px',objectFit:'cover',borderRadius:'8px', margin:"10px"}} />}
                            <Button variant="outlined" component="label" fullWidth sx={{ mb: 1 }} color={errors.img1 ? "error" : "primary"}>
                                Subir imagen 1
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={e => handleImageChange(e, "img1", setPreview1)}
                                />
                            </Button>
                            {errors.img1 && <Typography variant="caption" color="error">{errors.img1}</Typography>}
                        </div>
                        <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
                            {preview2 && <img src={preview2} alt="Previsualización 2" className="img-preview" style={{maxWidth:'120px',maxHeight:'120px',objectFit:'cover',borderRadius:'8px', margin:"10px"}} />}
                            <Button variant="outlined" component="label" fullWidth sx={{ mb: 1 }}>
                                Subir imagen 2
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={e => handleImageChange(e, "img2", setPreview2)}
                                />
                            </Button>
                        </div>
                        <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
                            {preview3 && <img src={preview3} alt="Previsualización 3" className="img-preview" style={{maxWidth:'120px',maxHeight:'120px',objectFit:'cover',borderRadius:'8px', margin:"10px"}} />}
                            <Button variant="outlined" component="label" fullWidth sx={{ mb: 1 }}>
                                Subir imagen 3
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={e => handleImageChange(e, "img3", setPreview3)}
                                />
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
            <DialogActions>
                <button onClick={onClose} className="btn-cancel" disabled={loading}>Cancelar</button>
                <button type="submit" className="btn-submit" onClick={handleSubmit} disabled={loading}>{loading ? "Guardando..." : "Guardar Oferta"}</button>
            </DialogActions>
        </Dialog>
    );
};

export default ProductOfferDialog;