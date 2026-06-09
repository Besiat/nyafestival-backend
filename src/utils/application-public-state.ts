import { Application, ApplicationState } from '../entity/festival/application.entity';

export const getPublicStateFromVisibility = (
    state: ApplicationState,
    showAccepted: boolean | undefined,
): ApplicationState => {
    if (showAccepted !== true && (state === ApplicationState.Accepted || state === ApplicationState.Denied)) {
        return ApplicationState.Pending;
    }

    return state;
};

export const getPublicApplicationState = (application: Application): ApplicationState => {
    const showAccepted = application.subNomination?.nomination?.nominationType?.showAccepted;
    return getPublicStateFromVisibility(application.state, showAccepted);
};

export const withPublicApplicationState = (application: Application): Application => {
    const state = getPublicApplicationState(application);

    if (state === application.state) {
        return application;
    }

    return { ...application, state };
};
