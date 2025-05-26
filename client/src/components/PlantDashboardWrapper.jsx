import React from 'react';
import { useParams } from 'react-router-dom';
import PlantDashboard from "./Dashboards/PlantDashboard";

const PlantDashboardWrapper = () => {
  const { plantId } = useParams();
  return <PlantDashboard plantId={plantId} />;
};

export default PlantDashboardWrapper;