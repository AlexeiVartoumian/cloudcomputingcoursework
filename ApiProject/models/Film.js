const mongoose = require('mongoose');

//** Film schema remains from cloud labs. 
// Design choice to keep it here for Ansible Playbook provisioning as a test collection to validate configuration. 
//  see Deployment\test\Ansible\roles\db\tasks\templates\createDb.sh.j2 */
const FilmSchema = new mongoose.Schema(
    {
    title: {
      type: String,
      required: true
    },
    year: {
      type: String,
      required: true
    },
    genre: {
      type: String,
      required: true
    },
    director: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true
    }
  },{
    collection: 'ColFilms',
    timestamps: true
  }
)


module.exports = mongoose.model('Film', FilmSchema, 'ColFilms')