import PropTypes from 'prop-types';
import { useEffect } from 'react';
// next
import { useRouter } from 'next/router';
// hooks
import useAuthState from '../hooks/useAuthState';
// routes
import { PATH_DASHBOARD } from '../routes/paths';

// ----------------------------------------------------------------------

GuestGuard.propTypes = {
    children: PropTypes.node,
};

export default function GuestGuard({ children }) {
    const { push } = useRouter();

    const { isAuthenticated } = useAuthState();

    useEffect(() => {
        if (isAuthenticated) {
            push(PATH_DASHBOARD.root);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    return <>{children}</>;
}
