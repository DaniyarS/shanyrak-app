import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import estateService from '../services/estateService';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import './Estates.css';

const Estates = () => {
  const { t } = useLanguage();
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

    if (!formData.kind) newErrors.kind = t('estates.propertyTypeRequired');
    if (!formData.email) newErrors.email = t('estates.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('estates.emailInvalid');
    if (!formData.addressLine) newErrors.addressLine = t('estates.addressRequired');
    if (!formData.city) newErrors.city = t('estates.cityRequired');
    if (!formData.district) newErrors.district = t('estates.districtRequired');
    if (!formData.lat) newErrors.lat = t('estates.latitudeRequired');
    if (!formData.lon) newErrors.lon = t('estates.longitudeRequired');
    if (!formData.areaM2) newErrors.areaM2 = t('estates.areaRequired');
    if (!formData.floor) newErrors.floor = t('estates.floorRequired');

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
      setErrors({ submit: error.response?.data?.message || t('estates.operationFailed') });
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
    if (!window.confirm(t('estates.deleteConfirm'))) return;

    try {
      await estateService.deleteEstate(estateId);
      fetchEstates();
    } catch (error) {
      alert(t('estates.deleteFailed'));
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
          <p>{t('estates.loadingProperties')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="estates-page">
      <div className="container">
        <div className="estates-header">
          <h1>{t('estates.title')}</h1>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>{t('estates.addProperty')}</Button>
          )}
        </div>

        {showForm && (
          <Card className="estate-form-card">
            <h2>{editingEstate ? t('estates.editProperty') : t('estates.addNewProperty')}</h2>
            <form onSubmit={handleSubmit} className="estate-form">
              <div className="form-row">
                <Input
                  label={t('estates.propertyType')}
                  name="kind"
                  value={formData.kind}
                  onChange={handleChange}
                  placeholder={t('estates.propertyTypePlaceholder')}
                  error={errors.kind}
                  required
                />
                <Input
                  label={t('estates.email')}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('estates.emailPlaceholder')}
                  error={errors.email}
                  required
                />
              </div>

              <Input
                label={t('estates.address')}
                name="addressLine"
                value={formData.addressLine}
                onChange={handleChange}
                placeholder={t('estates.addressPlaceholder')}
                error={errors.addressLine}
                required
              />

              <div className="form-row">
                <Input
                  label={t('estates.city')}
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder={t('estates.cityPlaceholder')}
                  error={errors.city}
                  required
                />
                <Input
                  label={t('estates.district')}
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder={t('estates.districtPlaceholder')}
                  error={errors.district}
                  required
                />
              </div>

              <div className="form-row">
                <Input
                  label={t('estates.latitude')}
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
                  label={t('estates.longitude')}
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
                  label={t('estates.area')}
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
                  label={t('estates.floor')}
                  name="floor"
                  type="number"
                  value={formData.floor}
                  onChange={handleChange}
                  placeholder={t('estates.floorPlaceholder')}
                  error={errors.floor}
                  required
                />
              </div>

              {errors.submit && (
                <div className="error-message">{errors.submit}</div>
              )}

              <div className="form-actions">
                <Button type="submit" variant="primary">
                  {editingEstate ? t('estates.updateProperty') : t('estates.addProperty')}
                </Button>
                <Button type="button" variant="ghost" onClick={resetForm}>
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="estates-grid">
          {estates.length === 0 ? (
            <Card>
              <p className="empty-message">
                {t('estates.noProperties')}
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
                    <strong>{t('estates.address')}:</strong> {estate.addressLine}
                  </p>
                  <p>
                    <strong>{t('estates.city')}:</strong> {estate.city}, {estate.district}
                  </p>
                  <p>
                    <strong>{t('estates.floor')}:</strong> {estate.floor}
                  </p>
                  <p>
                    <strong>{t('estates.contact')}:</strong> {estate.email}
                  </p>
                  <p className="estate-coords">
                    <strong>{t('estates.coordinates')}:</strong> {estate.lat}, {estate.lon}
                  </p>
                </div>
                <div className="estate-actions">
                  <Button
                    size="small"
                    variant="outline"
                    onClick={() => handleEdit(estate)}
                  >
                    {t('common.edit')}
                  </Button>
                  <Button
                    size="small"
                    variant="error"
                    onClick={() => handleDelete(estate.publicId)}
                  >
                    {t('common.delete')}
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
