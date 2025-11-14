import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { container } from '../infrastructure/di/ServiceContainer';
import { ContractStatus } from '../domain/entities/Contract';
import Card from '../components/Card';
import './Contracts.css';

const Contracts = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingContract, setConfirmingContract] = useState(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const getUserContractsUseCase = container.getGetUserContractsUseCase();
      const result = await getUserContractsUseCase.execute({ page: 0, size: 50 });

      if (result.success) {
        setContracts(result.contracts || []);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCompletion = async (contractId) => {
    if (!window.confirm(t('contracts.workCompleted'))) {
      return;
    }

    setConfirmingContract(contractId);
    try {
      const completeContractUseCase = container.getCompleteContractUseCase();
      const result = await completeContractUseCase.execute(contractId, true);

      if (result.success) {
        alert(t('contracts.completionConfirmed'));
        fetchContracts(); // Refresh the list
      } else {
        alert(result.errors?.submit || 'Failed to confirm completion');
      }
    } catch (error) {
      console.error('Error confirming completion:', error);
      alert(error.response?.data?.message || 'Failed to confirm completion');
    } finally {
      setConfirmingContract(null);
    }
  };

  const getStatusBadge = (contract) => {
    const statusMap = {
      [ContractStatus.ACTIVE]: { className: 'active', label: t('contracts.statusActive') },
      [ContractStatus.COMPLETED]: { className: 'completed', label: t('contracts.statusCompleted') },
      [ContractStatus.CANCELLED]: { className: 'cancelled', label: t('contracts.statusCancelled') },
      [ContractStatus.PENDING_COMPLETION]: { className: 'pending', label: t('contracts.statusPendingCompletion') },
    };

    const statusConfig = statusMap[contract.status] || statusMap[ContractStatus.ACTIVE];
    return <span className={`status-badge ${statusConfig.className}`}>{statusConfig.label}</span>;
  };

  const isCustomer = user?.role === 'CUSTOMER';
  const canConfirmCompletion = (contract) => {
    if (contract.status !== ContractStatus.ACTIVE && contract.status !== ContractStatus.PENDING_COMPLETION) {
      return false;
    }

    // Check if this user hasn't confirmed yet
    if (isCustomer) {
      return !contract.customerConfirmedComplete;
    } else {
      return !contract.builderConfirmedComplete;
    }
  };

  const getCompletionStatus = (contract) => {
    if (contract.status === ContractStatus.COMPLETED) {
      return t('contracts.bothPartiesConfirmed');
    }

    if (isCustomer && contract.customerConfirmedComplete) {
      return t('contracts.waitingForOtherParty');
    }

    if (!isCustomer && contract.builderConfirmedComplete) {
      return t('contracts.waitingForOtherParty');
    }

    return null;
  };

  if (loading) {
    return (
      <div className="contracts-page">
        <div className="container">
          <p className="loading-message">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contracts-page">
      <div className="container">
        <div className="contracts-header">
          <h1>{t('contracts.myContracts')}</h1>
        </div>

        {contracts.length === 0 ? (
          <Card>
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>{t('contracts.noContracts')}</h3>
              <p>{t('contracts.noContractsDescription')}</p>
            </div>
          </Card>
        ) : (
          <div className="contracts-grid">
            {contracts.map((contract) => (
              <Card key={contract.id} className="contract-card">
                <div className="contract-header">
                  <h3>{t('contracts.contractDetails')}</h3>
                  {getStatusBadge(contract)}
                </div>

                <div className="contract-details">
                  <div className="detail-row">
                    <span className="detail-label">{t('contracts.startDate')}:</span>
                    <span className="detail-value">
                      {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : '-'}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">{t('contracts.endDate')}:</span>
                    <span className="detail-value">
                      {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : '-'}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">{t('common.createdAt')}:</span>
                    <span className="detail-value">
                      {contract.createdAt ? new Date(contract.createdAt).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </div>

                {/* Completion Status */}
                {getCompletionStatus(contract) && (
                  <div className="completion-status">
                    <span className="status-icon">ℹ️</span>
                    {getCompletionStatus(contract)}
                  </div>
                )}

                {/* Action Button */}
                {canConfirmCompletion(contract) && (
                  <div className="contract-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleConfirmCompletion(contract.id)}
                      disabled={confirmingContract === contract.id}
                    >
                      {confirmingContract === contract.id
                        ? t('common.loading')
                        : t('contracts.confirmCompletion')}
                    </button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Contracts;
