/* global Craft */

import axios from 'axios';

export default {

    getCraftIdData(cb, cbError) {
        return axios.post(Craft.actionUrl + '/craftnet/id/craft-id', {}, {
                headers: {
                    'X-CSRF-Token': Craft.csrfTokenValue,
                }
            })
            .then(response => cb(response))
            .catch(error => cbError(error.response));
    },

}
