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

export const withPublicApplicationState = (application: Application, showAccepted?: boolean): Application => {
    const state = showAccepted === undefined ? getPublicApplicationState(application) : getPublicStateFromVisibility(application.state, showAccepted);

    if (state === application.state) {
        return { ...application, adminNote: state === ApplicationState.Invalid ? application.adminNote : null };
    }

    return { ...application, state, adminNote: state === ApplicationState.Invalid ? application.adminNote : null };
};
