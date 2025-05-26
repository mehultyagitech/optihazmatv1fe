import { lazy, Suspense } from 'react';
import { DrawerLoader } from '../../../components/SharedLoaders';

// Lazy load the large drawer component
const AddEditInventoryPointDrawer = lazy(() => import('./addEditInventoryPointDrawer.jsx'));

const LazyInventoryPointDrawer = (props) => {
  return (
    <Suspense fallback={<DrawerLoader />}>
      <AddEditInventoryPointDrawer {...props} />
    </Suspense>
  );
};

export default LazyInventoryPointDrawer; 