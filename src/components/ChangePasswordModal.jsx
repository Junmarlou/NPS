import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './ChangePasswordModal.css';

function ChangePasswordModal({ isOpen, onClose }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { updatePassword } = useAuth();

    if (!isOpen) return null;

    async function handleSubmit(e) {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        try {
            setMessage('');
            setError('');
            setLoading(true);
            await updatePassword(password);
            setMessage('Password updated successfully');
            setTimeout(() => {
                onClose();
                setMessage('');
                setPassword('');
                setConfirmPassword('');
            }, 2000);
        } catch (err) {
            setError('Failed to update password: ' + err.message);
        }
        setLoading(false);
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Change Password</h3>
                {error && <div className="auth-error">{error}</div>}
                {message && <div className="auth-success">{message}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
                        <button disabled={loading} type="submit" className="submit-btn">
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChangePasswordModal;
