"use strict";

import { useRouter } from 'next/router';
import { useEffect } from 'react';


const RedirectPage = () => {
    const router = useRouter();

    useEffect(() => {
        const { slug } = router.query;
        if (slug === undefined) return;
        router.push(`/api/${slug}`);
    }, [router]);

    return null;
};

export default RedirectPage;
