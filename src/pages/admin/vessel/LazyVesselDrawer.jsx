import { lazy, Suspense } from 'react';
import { DrawerLoader } from '../../../components/SharedLoaders';

// Lazy load the large drawer component
const AddEditVesselDrawer = lazy(() => import('./addEditVesselDrawer.jsx'));

const LazyVesselDrawer = (props) => {
  return (
    <Suspense fallback={<DrawerLoader />}>
      <AddEditVesselDrawer {...props} />
    </Suspense>
  );
};

export default LazyVesselDrawer; 