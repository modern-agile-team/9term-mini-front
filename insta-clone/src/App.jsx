// import { AuthProvider } from './store/AuthContext.jsx';
import { PostProvider } from './store/PostContext.jsx';
import AppRouter from './routes/index';

function App() {
  return (
    <PostProvider>
      <AppRouter />
    </PostProvider>
  );
}

export default App;
