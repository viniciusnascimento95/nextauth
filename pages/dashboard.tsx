import { useContext, useEffect } from "react"
import { AuthContext } from "../ contexts/AuthContext"
import { Can } from "../components/Can"
import { useCan } from "../hooks/useCan"
import { setupAPIClient } from "../services/api"
import { api } from "../services/apiClient"

import { withSSRAuth } from "../utils/withSSRAuth"

export default function dashboard() {
    const { user, isAuthenticated } = useContext(AuthContext)

    // const userCanSeeMetrics = useCan({ roles: ['administrator', 'editor'] });

    useEffect(() => {
        api.get('/me')
            .then(response => console.log(response))
            .catch(err => console.log(err))
    }, [])

    return (

        <>
            <h1>dashboard {user?.email}</h1>

            <Can permissions={['metrics.list']}>
                <div>Metricas</div>
            </Can>

        </>

    )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
    const apiClient = setupAPIClient(ctx);



    const response = await apiClient.get('/me');


    // console.log(response.data);
    return {
        props: {

        }
    }
})