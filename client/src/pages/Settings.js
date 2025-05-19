import React, { useState, useRef } from 'react';
import { Container, Card, Row, Col, Button, Form, Modal, ListGroup } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const API_BASE_URL = "http://34.129.60.74";

const Settings = () => {
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();
  // 信息修改
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdStep, setPwdStep] = useState(1); // 1: 验证当前密码, 2: 输入新密码
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [pwdError, setPwdError] = useState('');
  // 通知设置
  const [chatNotify, setChatNotify] = useState(true);
  const [likeNotify, setLikeNotify] = useState(true);
  // 隐私设置
  const [contactVisible, setContactVisible] = useState('public');
  const [blockedUsers, setBlockedUsers] = useState([
    { id: 'u1', name: 'Blocked User 1' },
    { id: 'u2', name: 'Blocked User 2' }
  ]);
  // 头像上传
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef();
  // 新增：本地编辑状态
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('token');

  // 模拟密码验证
  const handlePwdVerify = () => {
    // 这里假设 currentUser.password 是 '123456'，实际应调用后端接口
    if (currentPwd === '123456') {
      setPwdStep(2);
      setPwdError('');
    } else {
      setPwdError('Current password is incorrect');
    }
  };
  const handlePwdChange = async () => {
    setPwdError('');
    try {
      await axios.post('/api/users/change-password', {
        oldPassword: currentPwd,
        newPassword: newPwd
      }, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      setShowPwdModal(false);
      setPwdStep(1);
      setCurrentPwd('');
      setNewPwd('');
      alert('Password changed!');
    } catch (err) {
      setPwdError('Password change failed: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };
  const handleRemoveBlocked = (id) => {
    setBlockedUsers(blockedUsers.filter(u => u.id !== id));
  };

  // 取消按钮逻辑
  const handleCancel = () => {
    navigate('/profile');
  };

  // 保存更改逻辑（模拟，实际应调用后端）
  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', editName);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
        console.log('avatarFile:', avatarFile);
      }
      const response = await axios.put(`${API_BASE_URL}/api/users/profile`, formData, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      const user = response.data.user;
      if (!user.id && user._id) user.id = user._id;
      localStorage.setItem('user', JSON.stringify(user));
      if (login) login(token, user);
      alert('Profile updated!');
      navigate('/profile');
    } catch (err) {
      alert('Failed to update profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="my-5">
      <h2 className="mb-4">Settings</h2>
      <Row className="justify-content-center">
        <Col md={8} sm={12}>
          <Card>
            <Card.Body>
              {/* 个人信息设置 */}
              <Card.Title as="h4" className="mb-3">Profile Info</Card.Title>
              <Form.Group className="mb-3">
                <Form.Label>Avatar</Form.Label><br/>
                <img src={avatarFile ? URL.createObjectURL(avatarFile) : (currentUser?.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg')} alt="avatar" style={{width:64, height:64, borderRadius:'50%', objectFit:'cover', marginBottom:8}} />
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={e => setAvatarFile(e.target.files[0])}
                  />
                  <Button variant="outline-primary" size="sm" onClick={() => fileInputRef.current.click()}>
                    Choose Image
                  </Button>
                  <span style={{ marginLeft: 10, fontSize: 13, color: '#888' }}>{avatarFile ? avatarFile.name : 'No file chosen'}</span>
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" value={editName} onChange={e => setEditName(e.target.value)} />
              </Form.Group>
              <Button variant="outline-secondary" className="mb-3" onClick={()=>setShowPwdModal(true)}>Change Password</Button>
              <hr />
              {/* 消息通知设置 */}
              <Card.Title as="h4" className="mb-3">Notifications</Card.Title>
              <Form className="mb-3">
                <Form.Check
                  type="switch"
                  id="chat-notify"
                  label="Chat Message Notifications"
                  checked={chatNotify}
                  onChange={()=>setChatNotify(v=>!v)}
                  className="mb-3"
                />
                <Form.Check
                  type="switch"
                  id="like-notify"
                  label="Favorite Item Updates"
                  checked={likeNotify}
                  onChange={()=>setLikeNotify(v=>!v)}
                />
              </Form>
              <hr />
              {/* 隐私与安全设置 */}
              <Card.Title as="h4" className="mb-3">Privacy & Security</Card.Title>
              <Form.Group className="mb-3">
                <Form.Label>Who can see my contact info?</Form.Label>
                <Form.Select value={contactVisible} onChange={e=>setContactVisible(e.target.value)}>
                  <option value="public">Public</option>
                  <option value="trader">Only traders</option>
                  <option value="hidden">Hidden</option>
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label>Blocked Users</Form.Label>
                <ListGroup>
                  {blockedUsers.length === 0 && <ListGroup.Item>No blocked users</ListGroup.Item>}
                  {blockedUsers.map(u => (
                    <ListGroup.Item key={u.id} className="d-flex justify-content-between align-items-center">
                      {u.name}
                      <Button size="sm" variant="outline-danger" onClick={()=>handleRemoveBlocked(u.id)}>Unblock</Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Form.Group>
            </Card.Body>
            <div className="d-flex justify-content-end gap-3 p-3">
              <Button variant="secondary" onClick={handleCancel} disabled={saving}>Cancel</Button>
              <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </Card>
        </Col>
      </Row>
      {/* 修改密码弹窗 */}
      <Modal show={showPwdModal} onHide={()=>{setShowPwdModal(false); setPwdStep(1); setCurrentPwd(''); setNewPwd('');}}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pwdStep === 1 ? (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <Form.Control type="password" value={currentPwd} onChange={e=>setCurrentPwd(e.target.value)} />
                {pwdError && <div className="text-danger mt-2">{pwdError}</div>}
              </Form.Group>
              <Button variant="primary" onClick={handlePwdVerify}>Verify</Button>
            </>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control type="password" value={newPwd} onChange={e=>setNewPwd(e.target.value)} />
              </Form.Group>
              <Button variant="primary" onClick={handlePwdChange}>Change Password</Button>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Settings; 