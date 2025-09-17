import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import CaptureView from '../views/CaptureView.vue';
import CollectionView from '../views/CollectionView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/capture',
            name: 'capture',
            component: CaptureView
        },
        {
            path: '/collection',
            name: 'collection',
            component: CollectionView,     
            props: { mode: 'page' }
        }
    ]
});

export default router;
