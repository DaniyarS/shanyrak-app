import { useState, useEffect } from 'react';
import offerService from '../services/offerService';
import orderService from '../services/orderService';
import contractService from '../services/contractService';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import './Offers.css';

const Offers = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showContractForm, setShowContractForm] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offerFormData, setOfferFormData] = useState({
    price: '',
    message: '',
    unit: 'm2',
    daysEstimate: '',
  });
  const [contractFormData, setContractFormData] = useState({
    totalPrice: '',
    startDate: '',
    endDate: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.searchOrders();
      setOrders(Array.isArray(data) ? data : data?.content || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOfferChange = (e) => {
    const { name, value } = e.target;
    setOfferFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleContractChange = (e) => {
    const { name, value } = e.target;
    setContractFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateOfferForm = () => {
    const newErrors = {};

    if (!offerFormData.price) newErrors.price = 'Price is required';
    if (!offerFormData.message) newErrors.message = 'Message is required';
    if (!offerFormData.daysEstimate) newErrors.daysEstimate = 'Days estimate is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateContractForm = () => {
    const newErrors = {};

    if (!contractFormData.totalPrice) newErrors.totalPrice = 'Total price is required';
    if (!contractFormData.startDate) newErrors.startDate = 'Start date is required';
    if (!contractFormData.endDate) newErrors.endDate = 'End date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOffer = async (e) => {
    e.preventDefault();

    if (!validateOfferForm()) return;

    try {
      const offerData = {
        order: { uuid: selectedOrder.uuid },
        offer: {
          price: parseInt(offerFormData.price),
          message: offerFormData.message,
          unit: offerFormData.unit,
          daysEstimate: parseInt(offerFormData.daysEstimate),
        },
      };

      await offerService.sendOffer(offerData);
      alert('Offer submitted successfully!');
      resetOfferForm();
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Failed to submit offer' });
    }
  };

  const handleSubmitContract = async (e) => {
    e.preventDefault();

    if (!validateContractForm()) return;

    try {
      const contractData = {
        offer: { publicId: selectedOffer.publicId },
        contract: {
          totalPrice: parseInt(contractFormData.totalPrice),
          startDate: contractFormData.startDate,
          endDate: contractFormData.endDate,
        },
      };

      await contractService.confirmOffer(contractData);
      alert('Contract created successfully!');
      resetContractForm();
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Failed to create contract' });
    }
  };

  const handleMakeOffer = (order) => {
    setSelectedOrder(order);
    setShowOfferForm(true);
  };

  const handleCreateContract = (order, offer) => {
    setSelectedOrder(order);
    setSelectedOffer(offer);
    setContractFormData({
      totalPrice: offer.price?.toString() || '',
      startDate: '',
      endDate: '',
    });
    setShowContractForm(true);
  };

  const resetOfferForm = () => {
    setOfferFormData({
      price: '',
      message: '',
      unit: 'm2',
      daysEstimate: '',
    });
    setSelectedOrder(null);
    setShowOfferForm(false);
    setErrors({});
  };

  const resetContractForm = () => {
    setContractFormData({
      totalPrice: '',
      startDate: '',
      endDate: '',
    });
    setSelectedOrder(null);
    setSelectedOffer(null);
    setShowContractForm(false);
    setErrors({});
  };

  if (loading) {
    return (
      <div className="offers-page">
        <div className="container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="offers-page">
      <div className="container">
        <div className="offers-header">
          <h1>Available Orders</h1>
          <p>Browse orders and submit your offers</p>
        </div>

        {/* Offer Form Modal */}
        {showOfferForm && selectedOrder && (
          <div className="modal-overlay" onClick={resetOfferForm}>
            <Card className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Make an Offer</h2>
              <p className="modal-subtitle">{selectedOrder.title}</p>

              <form onSubmit={handleSubmitOffer} className="offer-form">
                <Input
                  label="Your Price"
                  name="price"
                  type="number"
                  value={offerFormData.price}
                  onChange={handleOfferChange}
                  placeholder="Enter your price"
                  error={errors.price}
                  required
                />

                <div className="input-wrapper">
                  <label className="input-label">
                    Unit <span className="input-required">*</span>
                  </label>
                  <select
                    name="unit"
                    value={offerFormData.unit}
                    onChange={handleOfferChange}
                    className="input"
                  >
                    <option value="m2">Per m²</option>
                    <option value="unit">Per unit</option>
                    <option value="hour">Per hour</option>
                    <option value="day">Per day</option>
                    <option value="fixed">Fixed price</option>
                  </select>
                </div>

                <Input
                  label="Estimated Days"
                  name="daysEstimate"
                  type="number"
                  value={offerFormData.daysEstimate}
                  onChange={handleOfferChange}
                  placeholder="Number of days to complete"
                  error={errors.daysEstimate}
                  required
                />

                <div className="input-wrapper">
                  <label className="input-label">
                    Your Message <span className="input-required">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={offerFormData.message}
                    onChange={handleOfferChange}
                    placeholder="Describe your offer and qualifications"
                    className={`input ${errors.message ? 'input-error' : ''}`}
                    rows="4"
                  />
                  {errors.message && (
                    <span className="input-error-message">{errors.message}</span>
                  )}
                </div>

                {errors.submit && (
                  <div className="error-message">{errors.submit}</div>
                )}

                <div className="form-actions">
                  <Button type="submit" variant="primary">
                    Submit Offer
                  </Button>
                  <Button type="button" variant="ghost" onClick={resetOfferForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Contract Form Modal */}
        {showContractForm && selectedOrder && selectedOffer && (
          <div className="modal-overlay" onClick={resetContractForm}>
            <Card className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Create Contract</h2>
              <p className="modal-subtitle">{selectedOrder.title}</p>

              <form onSubmit={handleSubmitContract} className="contract-form">
                <Input
                  label="Total Price"
                  name="totalPrice"
                  type="number"
                  value={contractFormData.totalPrice}
                  onChange={handleContractChange}
                  placeholder="Total contract price"
                  error={errors.totalPrice}
                  required
                />

                <Input
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={contractFormData.startDate}
                  onChange={handleContractChange}
                  error={errors.startDate}
                  required
                />

                <Input
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={contractFormData.endDate}
                  onChange={handleContractChange}
                  error={errors.endDate}
                  required
                />

                {errors.submit && (
                  <div className="error-message">{errors.submit}</div>
                )}

                <div className="form-actions">
                  <Button type="submit" variant="success">
                    Create Contract
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resetContractForm}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Orders List */}
        <div className="orders-grid">
          {orders.length === 0 ? (
            <Card>
              <p className="empty-message">No orders available at the moment.</p>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.uuid} className="order-card">
                <div className="order-header">
                  <h3>{order.title}</h3>
                  <span className="order-budget">
                    {order.budgetMin}
                    {order.budgetMax ? `-${order.budgetMax}` : '+'} ₸
                  </span>
                </div>
                <p className="order-description">{order.description}</p>
                <div className="order-details">
                  <p>
                    <strong>Category:</strong> {order.category?.name || 'N/A'}
                  </p>
                  {order.realEstate && (
                    <>
                      <p>
                        <strong>Location:</strong> {order.realEstate.city},{' '}
                        {order.realEstate.district}
                      </p>
                      <p>
                        <strong>Property:</strong> {order.realEstate.kind} -{' '}
                        {order.realEstate.areaM2} m²
                      </p>
                    </>
                  )}
                </div>
                <div className="order-actions">
                  <Button
                    variant="primary"
                    onClick={() => handleMakeOffer(order)}
                  >
                    Make Offer
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

export default Offers;
