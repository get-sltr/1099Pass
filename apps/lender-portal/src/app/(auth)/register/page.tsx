'use client';

import { useState, ChangeEvent } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [institutionName, setInstitutionName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement registration
  };

  const handleChange = (setter: (value: string) => void) => {
    return (e: ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
    };
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-2xl font-semibold text-gray-900">Register Institution</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name</label>
        <input
          type="text"
          value={institutionName}
          onChange={handleChange(setInstitutionName)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
        <input
          type="text"
          value={licenseNumber}
          onChange={handleChange(setLicenseNumber)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={handleChange(setEmail)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={handleChange(setPassword)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-600 transition font-medium"
      >
        Create Account
      </button>

      <p className="text-center text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-accent hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  );
}
