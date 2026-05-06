/**
 * Utilitaire fetch compatible avec la sécurité Microsoft Power Pages.
 * Permet d'interagir avec Dataverse via l'endpoint /_api/ sans erreur de jeton.
 */
export const powerPagesFetch = async (entitySet: string, options: RequestInit = {}) => {
    // Récupération du jeton anti-contrefaçon injecté par Power Pages
    const requestVerificationToken = (window as any).parent?.document?.getElementById("__RequestVerificationToken")?.getAttribute("value")
        || (document.getElementById("__RequestVerificationToken") as any)?.value;

    const defaultHeaders: HeadersInit = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
    };

    if (requestVerificationToken) {
        (defaultHeaders as any)["__RequestVerificationToken"] = requestVerificationToken;
    }

    const response = await fetch(`/_api/${entitySet}`, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erreur Dataverse (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    return response.status === 204 ? null : response.json();
};
