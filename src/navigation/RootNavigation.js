import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

let drawerRef = null;

export function setDrawerRef(ref) {
  drawerRef = ref;
}

export function openDrawer() {
  if (drawerRef && drawerRef.open) {
    drawerRef.open();
  }
}

export function closeDrawer() {
  if (drawerRef && drawerRef.close) {
    drawerRef.close();
  }
}

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    console.warn('[RootNavigation] Navigation not ready:', name, params);
  }
}
