import React, { useState } from 'react';
import { sendOtp, verifyOtp } from '../api';

export default function AuthPage({ onLoginSuccess }) {
  const [step, setStep] = useState(1); // 1: Phone & Details, 2: OTP Verification
  const [phone, setPhone] = useState('+91');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('Full-Stack Freelancer');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!phone || phone.trim().length < 10) {
      setError('Please provide a valid phone number with country code (e.g. +919876543210).');
      return;
    }

    try {
      setLoading(true);
      const res = await sendOtp(phone);
      setSuccessMsg(res.message || `Verification code sent via Minimoth to ${phone}`);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Unable to dispatch OTP. Check network and API configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpCode || otpCode.trim().length < 4) {
      setError('Please enter the verification code sent to your phone.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtp({
        phone,
        code: otpCode.trim(),
        name: name.trim(),
        title: title.trim()
      });

      localStorage.setItem('fpt_token', res.token);
      localStorage.setItem('fpt_user', JSON.stringify(res.user));
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="auth-title">Freelance Tracker</h1>
          <p className="auth-subtitle">
            {step === 1 ? 'Sign in or register via Minimoth OTP verification' : 'Enter security code'}
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label className="form-label" htmlFor="auth-phone">Mobile Phone (with Country Code)</label>
              <input
                id="auth-phone"
                type="tel"
                className="form-input"
                placeholder="+919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <p className="auth-helper-text">Powered by Minimoth SMS OTP service.</p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="auth-name">Your Full Name (Optional)</label>
              <input
                id="auth-name"
                type="text"
                className="form-input"
                placeholder="e.g. Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="auth-title">Freelance Role / Specialty</label>
              <input
                id="auth-title"
                type="text"
                className="form-input"
                placeholder="e.g. React & Node Consultant"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <button
              id="btn-send-otp"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem' }}
              disabled={loading}
            >
              {loading ? 'Sending OTP via Minimoth...' : 'Send Verification OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="otp-dispatch-pill">
              <span>Code sent to <strong>{phone}</strong></span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => { setStep(1); setError(''); }}
              >
                Change
              </button>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="auth-code">Enter 6-Digit OTP</label>
              <input
                id="auth-code"
                type="text"
                maxLength="6"
                className="form-input otp-box-input"
                placeholder="• • • • • •"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                autoFocus
                required
              />
              <p className="auth-helper-text">
                Check your SMS for the Minimoth code (Workshop test code: <code>123456</code>).
              </p>
            </div>

            <button
              id="btn-verify-otp"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem' }}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify & Enter Dashboard'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
