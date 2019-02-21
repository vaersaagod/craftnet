import Vue from 'vue'
import Vuex from 'vuex'
import licensesApi from '../../api/licenses';

Vue.use(Vuex)
Vue.use(require('vue-moment'))

var VueApp = new Vue();

/**
 * State
 */
const state = {
    expiringCmsLicensesTotal: 0,
    pluginLicenses: [],
    pluginLicensesLoading: false,
}

/**
 * Getters
 */
const getters = {

    expiresSoon() {
        return license => {
            if(!license.expiresOn) {
                return false
            }

            const today = new Date()
            let expiryDate = new Date()
            expiryDate.setDate(today.getDate() + 45)

            const expiresOn = new Date(license.expiresOn.date)

            if(expiryDate > expiresOn) {
                return true
            }

            return false
        }
    },

    daysBeforeExpiry() {
        return license => {
            const today = new Date()
            const expiresOn = new Date(license.expiresOn.date)
            const diff = expiresOn.getTime() - today.getTime()
            const diffDays = Math.round(diff / (1000 * 60 * 60 * 24))
            return diffDays;
        }
    },

    expiringPluginLicenses(state, getters) {
        return state.pluginLicenses.filter(license => {
            if (license.expired) {
                return false
            }

            if (license.autoRenew) {
                return false
            }

            return getters.expiresSoon(license)
        })
    },

    renewableLicenses(state, getters, rootState) {
        return (license, renew) => {
            let renewableLicenses = []


            // CMS license

            const expiryDateOptions = license.expiryDateOptions
            let expiryDate = expiryDateOptions[renew][1]

            renewableLicenses.push({
                type: 'cms-renewal',
                key: license.key,
                description: 'Craft ' + license.editionDetails.name,
                renew: renew,
                expiryDate: expiryDate,
                expiresOn: license.expiresOn,
                edition: license.editionDetails,
            })


            // Plugin licenses

            if (license.pluginLicenses.length > 0) {
                // Renewable plugin licenses
                const renewablePluginLicenses = state.pluginLicenses.filter(pluginLicense => {
                    // Only keep plugin licenses related to this CMS license
                    if (pluginLicense.cmsLicenseId !== license.id) {
                        return false
                    }

                    // Plugin licenses with no `expiresOn` are not renewable
                    if (!pluginLicense.expiresOn) {
                        return false
                    }

                    // Ignore the plugin license if it expires after the CMS license

                    if (!pluginLicense.expired) {
                        const pluginExpiresOn = VueApp.$moment(pluginLicense.expiresOn.date)
                        const expiryDateObject = VueApp.$moment(expiryDate)

                        if(expiryDateObject.diff(pluginExpiresOn) < 0) {
                            return false
                        }
                    }

                    return true
                })


                // Add renewable plugin licenses to the `renewableLicenses` array
                renewablePluginLicenses.forEach(function(renewablePluginLicense) {
                    renewableLicenses.push({
                        type: 'plugin-renewal',
                        key: renewablePluginLicense.key,
                        description: renewablePluginLicense.plugin.name,
                        expiryDate: expiryDate,
                        expiresOn: renewablePluginLicense.expiresOn,
                        edition: renewablePluginLicense.edition,
                    })
                })
            }

            return renewableLicenses
        }
    },

}

/**
 * Actions
 */
const actions = {

    // eslint-disable-next-line
    claimCmsLicense({}, licenseKey) {
        return new Promise((resolve, reject) => {
            licensesApi.claimCmsLicense(licenseKey, response => {
                if (response.data && !response.data.error) {
                    resolve(response);
                } else {
                    reject(response);
                }
            }, response => {
                reject(response);
            })
        })
    },

    // eslint-disable-next-line
    claimCmsLicenseFile({}, licenseFile) {
        return new Promise((resolve, reject) => {
            licensesApi.claimCmsLicenseFile(licenseFile, response => {
                if (response.data && !response.data.error) {
                    resolve(response);
                } else {
                    reject(response);
                }
            }, response => {
                reject(response);
            })
        })
    },

    // eslint-disable-next-line
    claimLicensesByEmail({}, email) {
        return new Promise((resolve, reject) => {
            licensesApi.claimLicensesByEmail(email, response => {
                if (response.data && !response.data.error) {
                    resolve(response);
                } else {
                    reject(response);
                }
            }, response => {
                reject(response);
            })
        })
    },

    // eslint-disable-next-line
    claimPluginLicense({}, licenseKey) {
        return new Promise((resolve, reject) => {
            licensesApi.claimPluginLicense(licenseKey, response => {
                if (response.data && !response.data.error) {
                    resolve(response);
                } else {
                    reject(response);
                }
            }, response => {
                reject(response);
            })
        })
    },

    getExpiringCmsLicensesTotal({commit}) {
        return new Promise((resolve, reject) => {
            licensesApi.getExpiringCmsLicensesTotal(response => {
                if (response.data && !response.data.error) {
                    commit('updateExpiringCmsLicensesTotal', response.data);
                    resolve(response);
                } else {
                    reject(response);
                }
            }, response => {
                reject(response);
            })
        })
    },

    getPluginLicenses({commit}) {
        if (state.pluginLicensesLoading) {
            return false
        }

        if (state.pluginLicenses.length > 0) {
            return false
        }

        commit('updatePluginLicensesLoading', true)

        return new Promise((resolve, reject) => {
            licensesApi.getPluginLicenses(response => {
                commit('updatePluginLicensesLoading', false)

                if (response.data && !response.data.error) {
                    commit('updatePluginLicenses', {pluginLicenses: response.data});
                    resolve(response);
                } else {
                    reject(response);
                }
            }, response => {
                commit('updatePluginLicensesLoading', false)

                reject(response);
            })
        })
    },

    releaseCmsLicense({commit}, licenseKey) {
        return new Promise((resolve, reject) => {
            licensesApi.releaseCmsLicense(licenseKey, response => {
                if (response.data && !response.data.error) {
                    resolve(response);
                } else {
                    reject(response);
                }
            }, response => {
                reject(response);
            })
        })
    },

    releasePluginLicense({commit}, {pluginHandle, licenseKey}) {
        return new Promise((resolve, reject) => {
            licensesApi.releasePluginLicense({pluginHandle, licenseKey}, response => {
                if (response.data && !response.data.error) {
                    commit('releasePluginLicense', {licenseKey});
                    resolve(response);
                } else {
                    reject(response);
                }
            }, response => {
                reject(response);
            })
        })
    },

    saveCmsLicense({commit}, license) {
        return new Promise((resolve, reject) => {
            licensesApi.saveCmsLicense(license, response => {
                if (response.data && !response.data.error) {
                    resolve(response);
                } else {
                    reject(response);
                }
            }, response => {
                reject(response);
            })
        })
    },

    savePluginLicense({commit}, license) {
        return new Promise((resolve, reject) => {
            licensesApi.savePluginLicense(license, response => {
                if (response.data && !response.data.error) {
                    commit('savePluginLicense', {license});
                    resolve(response);
                } else {
                    reject(response);
                }
            }, response => {
                reject(response);
            })
        })
    },

}

/**
 * Mutations
 */
const mutations = {

    updatePluginLicenses(state, {pluginLicenses}) {
        state.pluginLicenses = pluginLicenses;
    },

    updatePluginLicensesLoading(state, loading) {
        state.pluginLicensesLoading = loading
    },

    releasePluginLicense(state, {licenseKey}) {
        state.pluginLicenses.find((l, index, array) => {
            if (l.key === licenseKey) {
                array.splice(index, 1);
                return true;
            }

            return false;
        });
    },

    savePluginLicense(state, {license}) {
        let stateLicense = state.pluginLicenses.find(l => l.key == license.key);
        for (let attribute in license) {
            switch(attribute) {
                case 'autoRenew':
                    stateLicense[attribute] = license[attribute] === 1 || license[attribute] === '1' ? true : false
                    break
                default:
                    stateLicense[attribute] = license[attribute];
            }
        }
    },

    updateExpiringCmsLicensesTotal(state, total) {
        state.expiringCmsLicensesTotal = total
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
