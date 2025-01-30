import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage } from '@toolpad/core/SignInPage';
import { useTheme } from '@mui/material/styles';
import { login } from '../../api/services/authService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const providers = [{ id: 'credentials', name: 'Credentials' }];
// preview-start
const BRANDING = {
    logo: (
        <img
            src="https://mui.com/static/logo.svg"
            alt="MUI logo"
            style={{ height: 24 }}
        />
    ),
    title: 'Optihazmat',
};
// preview-end

export default function BrandingSignInPage() {
    const [error, setError] = React.useState(null);
    const [email, setEmail] = React.useState(''); // Track email input
    const [password, setPassword] = React.useState(''); // Track password input

    const navigator = React.useMemo(() => {
        return (path) => {
            window.location.href = path;
        };
    }, []);


    const signIn = async () => {
        setError(null);
        try {
            const response = await login(email, password);
    
            if (response && response.data && response.data.user) {
                toast.success("Login successful!");
                window.location.href = '/dashboard';
            } else {
                console.error("User data not found in the response");
                toast.error(response.message || "Login failed: User data not found.");
            }
        } catch (err) {
            toast.error(err.message || 'Login failed');
        }
    };

    const theme = useTheme();

    return (
        // preview-start
        <AppProvider branding={BRANDING} theme={theme}>
            <SignInPage
                signIn={signIn}
                providers={providers}
                slotProps={{
                    emailField: {
                        autoFocus: false,
                        value: email,
                        onChange: (e) => setEmail(e.target.value),
                    },
                    passwordField: {
                        value: password,
                        onChange: (e) => setPassword(e.target.value),
                    },
                }}
            />
            <ToastContainer />
            {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
        </AppProvider>
        // preview-end
    );
}
