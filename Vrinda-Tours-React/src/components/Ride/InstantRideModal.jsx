import RiderFindingView from './RiderFindingView';

/**
 * InstantRideModal — Forwarding wrapper for the unified RiderFindingView
 * Guarantees zero duplicate ride UI systems and seamless mobile bottom sheet / desktop side panel.
 */
export default function InstantRideModal(props) {
  return <RiderFindingView {...props} />;
}
