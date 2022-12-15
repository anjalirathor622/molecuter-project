const DbMixin = require("../mixins/db.mixin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = require("dotenv");
env.config();
//named import
module.exports={

    name:"user",

    /**
	 * Mixins
	 */
	mixins: [DbMixin("user")],

    settings: {
        SECRET_KEY: process.env.JWT_SECRET,
        fields: [
            
			"username",
            "email",
            "password",
            "role",
            "bio"
        ],

        entityValidator: {
            username: { type: "string", min: 2, pattern: /^[a-zA-Z0-9]+$/ },
			password: { type: "string", min: 6 },
			email: { type: "email" },
            role: { type: "string"},
			bio: { type: "string", optional: true },
        }
    },

    

    dependencies: [],

    actions: {

        //registrastion
        create: {
            params:{
            user: {type:"object"},
            },
			rest: {
				method: "POST",
				path: "/create"
			},
			async handler(ctx) {
                let entity = ctx.params.user;
                let salt = 10;
                const hash = bcrypt.hashSync(entity.password, salt);
                //await this.adapter.insert(payload);
				//return "Hello Moleculer "+ entity.name;
                return this.validateEntity(entity)
                .then(()=>{
                    if(entity.username)
                        return this.adapter.findOne({username:entity.username})
                        .then(found => {
                            if (found)
                                return Promise.reject("Username is exist!");
                            }
                        )
                    }
                )
                .then(() => {
                    if (entity.email)
                        return this.adapter.findOne({ email: entity.email })
                            .then(found => {
                                if (found)
                                    return Promise.reject("Email is exist!");
                                }
                            )
                        }
                    )
                    .then(() => {
                    entity.username=entity.username;
                    entity.password=hash;
                    entity.email=entity.email;
                    entity.bio=entity.bio;
                    entity.role=entity.role;
                    entity.createdAt = new Date();

                    let data= this.adapter.insert(entity);

                    return("your created succesfull" ,data);
                  
                        //.then(doc => this.transformDocuments(ctx, {}, doc))
                        //.then(user => this.transformEntity(user, true, ctx.meta.token))
                        //.then(json => this.entityChanged("created", json, ctx).then(() => json));
			    })
		    }
        },
        //user login 
        login:{
            rest: {
                method: "POST",
                path: "/login"
            },
            async handler(ctx){
                const { email, password } = ctx.params;

                

                return this.promise.resolve()
                .then(()=>this.adapter.findOne({email}))
                .then((user)=>{
                        if (!user){
                            return this.promise.reject('invalid user')
                        }else{
                            return bcrypt.compareSync(password, user.password)

                            .then(comprpass=>{
                                if(!comprpass){
                                    return this.Promise.reject('unregistered user')
                                   
                                   
                                }else{
                                    var token =jwt.sign(user, process.env.SECRET_KEY);
    
                                    return {
                                        msg:"user login succesfully",
                                        token}
                                    }
                            })
                        }
                    })
            }
        }
    },
    

    events: {},

    methods: {
        /**
		 * Generate a JWT token from user entity
		 * 
		 *  
		 */
		
        async seedDB(){
        await this.adapter.insertMany([
            {
                username:"anjali rathor", 
                email:"anjalirathor123@gmail.com",
                password:"anjali123",
                role:"admin",
                bio:"developer"
            },
            {
                username:"kiran rathor", 
                email:"kiranrathor123@gmail.com",
                password:"kiran123",
                role:"superadmin",
                bio:"developer2"
            },
           
        ]);
       
    }
    },

    /**
	 * Service created lifecycle event handler
	 */
	created() {

	},
    async started() {

	},
    async stopped() {

    }

}
