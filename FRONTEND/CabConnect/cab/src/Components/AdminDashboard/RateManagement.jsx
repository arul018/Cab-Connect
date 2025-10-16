import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, Upload, Image } from 'lucide-react';

const RateManagement = () => {
  const [rates, setRates] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:9095/admin/rates');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRates(Array.isArray(data) ? data : []);
      setError(null);
    } catch (error) {
      console.error('Error fetching rates:', error);
      setError(error.message);
      setRates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rate) => {
    setEditingId(rate.id);
    setEditData({
      ratePerKm: rate.ratePerKm,
      photoUrl: rate.photoUrl
    });
  };

  const handleSave = async (id) => {
    try {
      const payload = {};
      
      if (editData.ratePerKm !== undefined && editData.ratePerKm !== '') {
        payload.ratePerKm = parseFloat(editData.ratePerKm);
      }
      
      if (editData.photoUrl !== undefined && editData.photoUrl !== '') {
        payload.photoUrl = editData.photoUrl;
      }
      
      console.log('Sending payload:', payload);
      
      const response = await fetch(`http://localhost:9095/admin/rates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      setEditingId(null);
      fetchRates();
      alert('Rate updated successfully!');
    } catch (error) {
      console.error('Error updating rate:', error);
      alert('Failed to update rate: ' + error.message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Rate Management</h1>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Rate Management</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
        <button 
          onClick={fetchRates}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const handleFileUpload = (e, rateId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditData({...editData, photoUrl: event.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Vehicle Rate Management</h1>
        
        {rates.length === 0 ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
            <p className="text-yellow-800 font-medium">No rates found. Make sure the AdminService is running.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            {rates.map((rate) => (
              <div key={rate.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{rate.vehicleClass}</h3>
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    {rate.photoUrl ? (
                      <img src={rate.photoUrl} alt={rate.vehicleClass} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <Image size={24} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {editingId === rate.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rate per KM (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editData.ratePerKm || ''}
                        onChange={(e) => setEditData({...editData, ratePerKm: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter rate"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Photo</label>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, rate.id)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="text"
                          value={editData.photoUrl || ''}
                          onChange={(e) => setEditData({...editData, photoUrl: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Or enter photo URL"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={() => handleSave(rate.id)}
                        className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Save size={16} />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                      >
                        <X size={16} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="text-2xl font-bold text-green-600">₹{parseFloat(rate.ratePerKm).toFixed(rate.ratePerKm % 1 === 0 ? 0 : 2)}</div>
                    <p className="text-gray-600">per kilometer</p>
                    
                    <button
                      onClick={() => handleEdit(rate)}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Edit2 size={16} />
                      <span>Edit Rate & Photo</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RateManagement;