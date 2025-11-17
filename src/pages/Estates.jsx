import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import estateService from '../services/estateService';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import './Estates.css';

const Estates = () => {
  const { t, language } = useLanguage();
  const [estates, setEstates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEstate, setEditingEstate] = useState(null);
  const [formData, setFormData] = useState({
    kind: '',
    addressLine: '',
    city: '',
    district: '',
    areaM2: '',
    floor: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchEstates();
    fetchCities();
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

  const fetchCities = async () => {
    try {
      const getCitiesUseCase = container.getGetCitiesUseCase();
      const result = await getCitiesUseCase.execute(false); // Get all cities

      if (result.success) {
        setCities(result.cities);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
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
    if (!formData.addressLine) newErrors.addressLine = t('estates.addressRequired');
    if (!formData.city) newErrors.city = t('estates.cityRequired');
    if (!formData.district) newErrors.district = t('estates.districtRequired');
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
      addressLine: estate.addressLine || '',
      city: estate.city || '',
      district: estate.district || '',
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
      addressLine: '',
      city: '',
      district: '',
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
              <Select
                label={t('estates.propertyType')}
                name="kind"
                value={formData.kind}
                onChange={handleChange}
                options={[
                  { value: 'APARTMENT', label: t('estates.apartment') },
                  { value: 'HOUSE', label: t('estates.house') },
                  { value: 'OFFICE', label: t('estates.office') },
                  { value: 'COMMERCIAL', label: t('estates.commercial') },
                ]}
                placeholder={t('estates.propertyTypePlaceholder')}
                error={errors.kind}
                required
              />

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
                <Select
                  label={t('estates.city')}
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  options={cities.map((city) => ({
                    value: city.getLocalizedName(language),
                    label: city.getLocalizedName(language),
                  }))}
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
