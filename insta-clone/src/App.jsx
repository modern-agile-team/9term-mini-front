import { AuthProvider } from './store/AuthContext.jsx';
import { PostProvider } from './store/PostContext.jsx';
import AppRouter from './routes/index';

function App() {
  return (
    <AuthProvider>
      <PostProvider>
        <AppRouter />
      </PostProvider>
    </AuthProvider>
  );
}

export default App;
