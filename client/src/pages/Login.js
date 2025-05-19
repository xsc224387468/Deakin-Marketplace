import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('Attempting login with:', { email: formData.email });
            const response = await axios.post('http://localhost:5000/api/users/login', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Login response:', response.data);
            
            if (response.data.token && response.data.user) {
                login(response.data.token, response.data.user);
                navigate('/');
            } else {
                setError('Invalid response from server');
            }
        } catch (err) {
            console.error('Login error:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <h2 className="text-center mb-4">Login</h2>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your Deakin email"
                                        required
                                    />
                                    <Form.Text className="text-muted">
                                        Please use your Deakin email address (@deakin.edu.au)
                                    </Form.Text>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        required
                                    />
                                </Form.Group>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-100"
                                    disabled={loading}
                                >
                                    {loading ? 'Logging in...' : 'Login'}
                                </Button>
                            </Form>
                            <div className="text-center mt-3">
                                <Link to="/register">Don't have an account? Register</Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Login; 