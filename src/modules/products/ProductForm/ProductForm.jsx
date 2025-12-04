import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm, Controller } from "react-hook-form";
import { MenuItem, Select, FormControl, InputLabel, TextField, Button, Typography } from "@mui/material";
import "./ProductForm.css";

import api from "../../../service/axiosConfig";
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';

import { useUserStore } from "../../../App/stores/Store";
import { useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL_BACKEND; //Variable de entorno para la URL del backend.

//Listas de opciones para el formulario
const categories = [ "Hogar", "Juguetes", "Libros", "Ropa", "Tecnología", "Deportes", "Entretenimiento"];
const conditions = [ "Nuevo", "Reacondicionado", "Usado"];
const delivery = [ "Envío", "Digital"];

const ProductForm = ({ open = false, onClose, editProductData }) => {

    const { register, handleSubmit, formState: { errors }, reset, control } = useForm(); //Hook para manejar el formulario.
    const [preview1, setPreview1] = useState(null); // Estado para la primera imagen      
    const [preview2, setPreview2] = useState(null); // Estado para la segunda imagen
    const [preview3, setPreview3] = useState(null); // Estado para la tercera imagen
    const [buttonDisabled, setButtonDisabled] = useState(false); // Estado para deshabilitar el botón de envío
    const {id} = useUserStore(); // Obtener el ID del usuario desde el store global
    const location = useLocation() // Hook para obtener la ubicación actual

    // Efecto para resetear el formulario cuando se abre el modal o cambia el producto a editar
    useEffect(() => {
        if (open) { 
            if (editProductData) { // Si hay datos de producto para editar, rellenar el formulario con esos datos
                reset({
                    title: editProductData.title || "",
                    description: editProductData.description || "",
                    category: editProductData.category || "",
                    condition: editProductData.condition || "",
                    amount: editProductData.amount || "",
                    interests: editProductData.interests || "",
                    additionalNotes: editProductData.additionalNotes || "",
                    ubication: editProductData.ubication || "",
                    deliveryMethod: editProductData.deliveryMethod === "Envio" ? "Envío" : editProductData.deliveryMethod,
                    priceSwapcoins: editProductData.priceSwapcoins || "",
                    imagen1: undefined,
                    imagen2: undefined,
                    imagen3: undefined,
            });
            setPreview1(editProductData.image1 ? `${API_URL}${editProductData.image1}` : null);
            setPreview2(editProductData.image2 ? `${API_URL}${editProductData.image2}` : null);
            setPreview3(editProductData.image3 ? `${API_URL}${editProductData.image3}` : null);
            } else {
                reset();
                setPreview1(null);
                setPreview2(null);
                setPreview3(null);
            }
            setButtonDisabled(false);
        }
    }, [open, reset, editProductData]);

    const onSubmit = async (data) => { // Función que se ejecuta al enviar el formulario
        const formData = new FormData();
        formData.append('idUser', id);
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('category', data.category);
        formData.append('condition', data.condition);
        formData.append('amount', data.amount);
        formData.append('additionalNotes', data.additionalNotes);
        formData.append('ubication', data.ubication);
        formData.append('deliveryMethod', data.deliveryMethod);
        // Campo opcional de precio en swapcoins
        if (data.priceSwapcoins) formData.append('priceSwapcoins', data.priceSwapcoins);
        if (data.interests) formData.append('interests', data.interests);

        // Agregar imágenes solo si existen
        if (data.imagen1 && data.imagen1[0]) formData.append('image1', data.imagen1[0]);
        if (data.imagen2 && data.imagen2[0]) formData.append('image2', data.imagen2[0]);
        if (data.imagen3 && data.imagen3[0]) formData.append('image3', data.imagen3[0]);

        if(!editProductData){ // Si no hay datos de producto para editar, crear un nuevo producto
            try {
                await api.post('/products', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                toast.success("Publicación creada exitosamente.", {position: "top-center"}); //Mensaje informativo.
                setButtonDisabled(true);
                setTimeout(() => {
                    if(location.pathname === "/perfil/publicaciones" || location.pathname === "/intercambios"){
                        window.location.reload();
                    } else {
                        if (onClose) onClose();
                    }
                }, 2000);
            } catch (error) {
                toast.error(error.response.data.error, {position: "top-center"}); //Mensaje informativo.
            }
        }else { // Si hay datos de producto para editar, actualizar el producto existente
            try {
                await api.put(`/products/${editProductData.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                toast.success("Producto actualizado exitosamente.", {position: "top-center"});
                setButtonDisabled(true);
                setTimeout(() => {
                    if(location.pathname === "/perfil/publicaciones" || location.pathname === "/intercambios"){
                        window.location.reload();
                    } else {
                        if (onClose) onClose();
                    }
                }, 2000);
            } catch (error) {
                toast.error(error.response?.data?.error || "Error al actualizar el producto", {position: "top-center"});
            }
        }
    };

    if (!open) return null;


    //Funciones para previsualizar imágenes
    const handleImageChange1 = (e) => { // Maneja el cambio de la primera imagen
        const file = e.target.files && e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview1(reader.result);
            reader.readAsDataURL(file);
        } else {
            setPreview1(null);
        }
    };

    const handleImageChange2 = (e) => { //Función para la segunda imagen
        const file = e.target.files && e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview2(reader.result);
            reader.readAsDataURL(file);
        } else {
            setPreview2(null);
        }
    };

    const handleImageChange3 = (e) => { //Función para la tercera imagen
        const file = e.target.files && e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview3(reader.result);
            reader.readAsDataURL(file);
        } else {
            setPreview3(null);
        }
    };

    return createPortal(
        <div className="product-modal-overlay">
            <div className="product-modal-content">
               <div className="product-modal-container">
                    <h2>Producto</h2>
                    <div className="form-title">Publica tu producto para intercambiar</div>
                    <button className="product-modal-close" onClick={onClose} aria-label="Cerrar">&times;</button>
                    <form className="formProduct" onSubmit={handleSubmit(onSubmit)}>
                        
                        {/* Nombre del producto */}
                        <div className="title">
                            <TextField 
                                label="Nombre del producto"
                                variant="outlined"
                                fullWidth
                                size="small"
                                minRows={2}
                                sx={{ mb: 1 }}
                                error={!!errors.title}
                                helperText={errors.title ? 'Este campo es obligatorio' : ''}
                                {...register("title", { required: true })}
                            />
                        </div>

                        {/* Descripción */}
                        <div className="description">
                            <TextField
                                label="Descripción del producto"
                                variant="outlined"
                                fullWidth
                                size="medium"
                                multiline
                                minRows={3}
                                sx={{ mb: 1 }}
                                error={!!errors.description}
                                helperText={errors.description ? 'Este campo es obligatorio' : ''}
                                {...register("description", { required: true })}
                            />
                        </div>

                        {/* Categoría */}
                        <div className="category">
                            <FormControl fullWidth size="small" sx={{ mb: 1 }} error={!!errors.category}>
                                <InputLabel id="category-label">Categoría</InputLabel>
                                <Controller
                                    name="category"
                                    control={control}
                                    rules={{ required: true }}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <Select
                                            labelId="category-label"
                                            label="Categoría"
                                            {...field}
                                        >
                                            <MenuItem value=""><em>Selecciona una categoría</em></MenuItem>
                                            {categories.map((cat) => (
                                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                                {errors.category && <Typography variant="caption" color="error">Este campo es obligatorio</Typography>}
                            </FormControl>
                        </div>

                        {/* Condición */}
                        <div className="condition">
                            <FormControl fullWidth size="small" sx={{ mb: 1 }} error={!!errors.condition}>
                                <InputLabel id="condition-label">Condición</InputLabel>
                                <Controller
                                    name="condition"
                                    control={control}
                                    rules={{ required: true }}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <Select
                                            labelId="condition-label"
                                            label="Condición"
                                            {...field}
                                        >
                                            <MenuItem value=""><em>Selecciona una condición</em></MenuItem>
                                            {conditions.map((cond) => (
                                                <MenuItem key={cond} value={cond}>{cond}</MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                                {errors.condition && <Typography variant="caption" color="error">Este campo es obligatorio</Typography>}
                            </FormControl>
                        </div>

                        {/* Cantidad */}
                        <div className="amount">
                            <TextField
                                label="Cantidad"
                                type="number"
                                variant="outlined"
                                fullWidth
                                size="small"
                                inputProps={{ min: 1 }}
                                sx={{ mb: 1 }}
                                error={!!errors.amount}
                                helperText={errors.amount ? 'Este campo es obligatorio' : ''}
                                {...register("amount", { required: true })}
                            />
                        </div>

                        {/* Intereses */}
                        <div className="interests">
                            <TextField
                                label="¿Qué aceptarias por el producto?"
                                variant="outlined"
                                fullWidth
                                size="small"
                                multiline
                                minRows={2}
                                sx={{ mb: 1 }}
                                {...register("interests", { required: true })}
                            />
                        </div>

                        {/* Notas adicionales */}
                        <div className="additionalNotes">
                            <TextField
                                label="Notas adicionales"
                                variant="outlined"
                                fullWidth
                                size="small"
                                multiline
                                minRows={2}
                                sx={{ mb: 1 }}
                                error={!!errors.additionalNotes}
                                helperText={errors.additionalNotes ? 'Este campo es obligatorio' : ''}
                                {...register("additionalNotes", { required: true })}
                            />
                        </div>

                        {/* Ubicación */}
                        <div className="ubication">
                            <TextField
                                label="Ciudad/País"
                                variant="outlined"
                                fullWidth
                                size="small"
                                sx={{ mb: 1 }}
                                error={!!errors.ubication}
                                helperText={errors.ubication ? 'Este campo es obligatorio' : ''}
                                {...register("ubication", { required: true })}
                            />
                        </div>

                        {/* Método de entrega */}
                        <div className="deliveryMethod">
                            <FormControl fullWidth size="small" sx={{ mb: 1 }} error={!!errors.deliveryMethod}>
                                <InputLabel id="deliveryMethod-label">Método de entrega</InputLabel>
                                <Controller
                                    name="deliveryMethod"
                                    control={control}
                                    rules={{ required: true }}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <Select
                                            labelId="deliveryMethod-label"
                                            label="Método de entrega"
                                            {...field}
                                        >
                                            <MenuItem value=""><em>Selecciona el método de entrega</em></MenuItem>
                                            {delivery.map((shape) => (
                                                <MenuItem key={shape} value={shape}>{shape}</MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                                {errors.deliveryMethod && <Typography variant="caption" color="error">Este campo es obligatorio</Typography>}
                            </FormControl>
                        </div>

                        {/* Precio en swapcoins (opcional) */}
                        <div className="swapcoins">
                            <TextField
                                label="Precio en swapcoins (opcional)"
                                type="text"
                                variant="outlined"
                                fullWidth
                                size="small"
                                inputProps={{ min: 0 }}
                                sx={{ mb: 1 }}
                                {...register("priceSwapcoins")}
                            />
                        </div>

                        {/* Imagen 1 */}
                        <div className="imagen1">
                            {preview1 && <img src={preview1} alt="Previsualización 1" className="imagen1-preview" />}
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                sx={{ mb: 1 }}
                                color={errors.imagen1 ? "error" : "primary"}
                            >
                                Subir imagen 1
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                {...register("imagen1", { required: !editProductData })}
                                onChange={e => {
                                    handleImageChange1(e);
                                    register("imagen1").onChange(e);
                                }}
                            />
                            </Button>
                            {errors.imagen1 && <Typography variant="caption" color="error">Este campo es obligatorio</Typography>}
                        </div>

                        {/* Imagen 2 */}
                        <div className="imagen2">
                            {preview2 && <img src={preview2} alt="Previsualización 2" className="imagen2-preview" />}
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                sx={{ mb: 1 }}
                                    color={errors.imagen2 ? "error" : "primary"}
                            >
                                Subir imagen 2
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                        {...register("imagen2")}
                                        onChange={e => {
                                            handleImageChange2(e);
                                            register("imagen2").onChange(e);
                                        }}
                                />
                            </Button>
                                {/* No mostrar error ya que es opcional */}
                        </div>

                        {/* Imagen 3 */}
                        <div className="imagen3">
                            {preview3 && <img src={preview3} alt="Previsualización 3" className="imagen3-preview" />}
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                sx={{ mb: 1 }}
                                    color={errors.imagen3 ? "error" : "primary"}
                            >
                                Subir imagen 3
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                        {...register("imagen3")}
                                        onChange={e => {
                                            handleImageChange3(e);
                                            register("imagen3").onChange(e);
                                        }}
                                />
                            </Button>
                                {/* No mostrar error ya que es opcional */}
                        </div>
                        <Button type="submit" disabled={buttonDisabled} variant="contained" fullWidth sx={{ mt: 2, fontWeight: 'bold', backgroundColor:"#285194", fontFamily: "Outfit   " }}>
                            {!editProductData ? 'Crear Publicación' : 'Actualizar Publicación'}
                        </Button>
                    </form>
               </div>
        </div>
        <div>
            <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar={false} closeOnClick pauseOnHover draggable/>
        </div>
    </div>,
    document.body
    );
}

export default ProductForm;
