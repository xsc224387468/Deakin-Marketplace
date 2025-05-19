import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
const API_BASE_URL = "http://34.129.60.74";

function Sell() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        condition: 'New',
        images: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            images: files
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser || !currentUser.id) {
            setError('Please log in to sell items');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('condition', formData.condition);
            formDataToSend.append('seller', currentUser.id);
            
            formData.images.forEach(image => {
                formDataToSend.append('images', image);
            });

            const response = await axios.post(`${API_BASE_URL}/api/items`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            console.log('Item created successfully:', response.data);
            navigate(`/items/${response.data._id}`);
        } catch (err) {
            console.error('Error creating item:', err);
            setError(err.response?.data?.message || 'Failed to create item. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        return (
            <Container className="mt-5">
                <Alert variant="warning">
                    Please log in to sell items.
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <h2 className="mb-4">Sell an Item</h2>
            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Enter item title"
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={3}
                        placeholder="Describe your item"
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Price ($)</Form.Label>
                    <Form.Control
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="Enter price"
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a category</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Books">Books</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Other">Other</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Condition</Form.Label>
                    <Form.Select
                        name="condition"
                        value={formData.condition}
                        onChange={handleChange}
                        required
                    >
                        <option value="New">New</option>
                        <option value="Like New">Like New</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Images</Form.Label>
                    <Form.Control
                        type="file"
                        onChange={handleImageChange}
                        multiple
                        accept="image/*"
                        required
                    />
                    <Form.Text className="text-muted">
                        You can upload multiple images. The first image will be the main image.
                    </Form.Text>
                </Form.Group>

                <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Creating...' : 'Create Listing'}
                </Button>
            </Form>
        </Container>
    );
}

export default Sell; 