import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage } from '@toolpad/core/SignInPage';
import { useTheme } from '@mui/material/styles';

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
    const navigator = React.useMemo(() => {
        return (path) => {
            window.location.href = path;
        };
    })
    const signIn = async (provider) => {
        const promise = new Promise((resolve) => {
            setTimeout(() => {
                navigator('/users');
                console.log(`Sign in with ${provider.id}`);
                resolve();
            }, 500);
        });
        return promise;
    };
    const theme = useTheme();
    return (
        // preview-start
        <AppProvider branding={BRANDING} theme={theme}>
            <SignInPage
                signIn={signIn}
                providers={providers}
                slotProps={{ emailField: { autoFocus: false } }}
            />
        </AppProvider>
        // preview-end
    );
}
