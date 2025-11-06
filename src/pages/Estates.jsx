import { useState, useEffect } from 'react';
import estateService from '../services/estateService';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import './Estates.css';

const Estates = () => {
  const [estates, setEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEstate, setEditingEstate] = useState(null);
  const [formData, setFormData] = useState({
    kind: '',
    email: '',
    addressLine: '',
    city: '',
    district: '',
    lat: '',
    lon: '',
    areaM2: '',
    floor: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchEstates();
  }, []);

  const fetchEstates = async () => {
    try {
      setLoading(true);
      const data = await estateService.getCustomerEstates();
      setEstates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching estates:', error);
      setEstates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.kind) newErrors.kind = 'Property type is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.addressLine) newErrors.addressLine = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.lat) newErrors.lat = 'Latitude is required';
    if (!formData.lon) newErrors.lon = 'Longitude is required';
    if (!formData.areaM2) newErrors.areaM2 = 'Area is required';
    if (!formData.floor) newErrors.floor = 'Floor is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editingEstate) {
        await estateService.updateEstate({
          publicId: editingEstate.publicId,
          ...formData,
          lat: parseFloat(formData.lat),
          lon: parseFloat(formData.lon),
          areaM2: parseFloat(formData.areaM2),
          floor: parseInt(formData.floor),
        });
      } else {
        await estateService.createEstate(formData);
      }

      fetchEstates();
      resetForm();
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Operation failed' });
    }
  };

  const handleEdit = (estate) => {
    setEditingEstate(estate);
    setFormData({
      kind: estate.kind || '',
      email: estate.email || '',
      addressLine: estate.addressLine || '',
      city: estate.city || '',
      district: estate.district || '',
      lat: estate.lat?.toString() || '',
      lon: estate.lon?.toString() || '',
      areaM2: estate.areaM2?.toString() || '',
      floor: estate.floor?.toString() || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (estateId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      await estateService.deleteEstate(estateId);
      fetchEstates();
    } catch (error) {
      alert('Failed to delete property');
    }
  };

  const resetForm = () => {
    setFormData({
      kind: '',
      email: '',
      addressLine: '',
      city: '',
      district: '',
      lat: '',
      lon: '',
      areaM2: '',
      floor: '',
    });
    setEditingEstate(null);
    setShowForm(false);
    setErrors({});
  };

  if (loading) {
    return (
      <div className="estates-page">
        <div className="container">
          <p>Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="estates-page">
      <div className="container">
        <div className="estates-header">
          <h1>My Properties</h1>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>Add Property</Button>
          )}
        </div>

        {showForm && (
          <Card className="estate-form-card">
            <h2>{editingEstate ? 'Edit Property' : 'Add New Property'}</h2>
            <form onSubmit={handleSubmit} className="estate-form">
              <div className="form-row">
                <Input
                  label="Property Type"
                  name="kind"
                  value={formData.kind}
                  onChange={handleChange}
                  placeholder="e.g., Apartment, House"
                  error={errors.kind}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@example.com"
                  error={errors.email}
                  required
                />
              </div>

              <Input
                label="Address"
                name="addressLine"
                value={formData.addressLine}
                onChange={handleChange}
                placeholder="Street address"
                error={errors.addressLine}
                required
              />

              <div className="form-row">
                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  error={errors.city}
                  required
                />
                <Input
                  label="District"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="District"
                  error={errors.district}
                  required
                />
              </div>

              <div className="form-row">
                <Input
                  label="Latitude"
                  name="lat"
                  type="number"
                  step="any"
                  value={formData.lat}
                  onChange={handleChange}
                  placeholder="51.1694"
                  error={errors.lat}
                  required
                />
                <Input
                  label="Longitude"
                  name="lon"
                  type="number"
                  step="any"
                  value={formData.lon}
                  onChange={handleChange}
                  placeholder="71.4491"
                  error={errors.lon}
                  required
                />
              </div>

              <div className="form-row">
                <Input
                  label="Area (m²)"
                  name="areaM2"
                  type="number"
                  step="0.1"
                  value={formData.areaM2}
                  onChange={handleChange}
                  placeholder="50"
                  error={errors.areaM2}
                  required
                />
                <Input
                  label="Floor"
                  name="floor"
                  type="number"
                  value={formData.floor}
                  onChange={handleChange}
                  placeholder="5"
                  error={errors.floor}
                  required
                />
              </div>

              {errors.submit && (
                <div className="error-message">{errors.submit}</div>
              )}

              <div className="form-actions">
                <Button type="submit" variant="primary">
                  {editingEstate ? 'Update Property' : 'Add Property'}
                </Button>
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="estates-grid">
          {estates.length === 0 ? (
            <Card>
              <p className="empty-message">
                No properties yet. Add your first property to get started.
              </p>
            </Card>
          ) : (
            estates.map((estate) => (
              <Card key={estate.publicId} className="estate-card">
                <div className="estate-header">
                  <h3>{estate.kind}</h3>
                  <span className="estate-area">{estate.areaM2} m²</span>
                </div>
                <div className="estate-details">
                  <p>
                    <strong>Address:</strong> {estate.addressLine}
                  </p>
                  <p>
                    <strong>City:</strong> {estate.city}, {estate.district}
                  </p>
                  <p>
                    <strong>Floor:</strong> {estate.floor}
                  </p>
                  <p>
                    <strong>Contact:</strong> {estate.email}
                  </p>
                  <p className="estate-coords">
                    <strong>Coordinates:</strong> {estate.lat}, {estate.lon}
                  </p>
                </div>
                <div className="estate-actions">
                  <Button
                    size="small"
                    variant="outline"
                    onClick={() => handleEdit(estate)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="error"
                    onClick={() => handleDelete(estate.publicId)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Estates;
