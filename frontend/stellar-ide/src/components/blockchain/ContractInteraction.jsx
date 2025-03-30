// In ContractInteraction.jsx
import ContractInteractionForm from './ContractInteractionForm';

// Within the component:
{contractDetails && contractDetails.abi && (
  <ContractInteractionForm 
    contractId={contractDetails.contractId}
    contractAbi={contractDetails.abi}
  />
)}