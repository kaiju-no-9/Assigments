import  {Class ,User} from "../models/class"
import{ClassSchema ,AddStudent} from "../schema/schema"

export const  createClass = async(req, res)=>{
    const teacherId = req.userId;
    const parsed =  ClassSchema.safePrase(req.body);
    if(!parsed.success){
        res.status(400).json({
            "success": false,
            "error": "Invalid request schema",
        })
    }
    try  { 
    const {className}= parsed.data;
      const newClass = await Class.create({
        teacherId,
        className,
        studenetIds:[]
      })
      
      res.status(201).json({
   "success": true,
   "data": {
    "_id": newClass._id,
    "className": newClass.className,
    "teacherId": newClass.teacherId,
    "studentIds": newClass.studenetIds
  }
      })
    }catch(error){
        res.satus(500).send("interal server error ")
    }

      
}

export const  addStudent = async(req ,res)=>{
    const paraseData = AddStudent.safePrase(req.body);
    if(!paraseData){
        res.status(400).json({
            "success": false,
            "error": "Invalid request schema",
        })
    }
    try{
    const {studentId} =req.body;
    const Class = await Class.findById(teacherId)
    if(!Class){
        res.satus(400).json({
            "success": false,
            "error": "Class not found"
        })

        if (Class.teacherId.toStrig() != req.userId){
            res.status(403).json({
                    "success": false,
                    "error": "Forbidden, not class teacher"
                  })
        }
        //check itt was already there 
        const student = await User.findById(studentId)
        if(!student){
            res.satus(404).json({
                "success": false,
                "error": "Student not found"
            })
        }
        if(!Class.studentIds.include(studentId)){
            Class.studenetIds.push(studentId)
            await Class.save()
        }
        res.status(200).json({
        "success": true,
        "data": {
          "_id": Class._id,
          "className": Class.className,
          "teacherId": Class.teacherId,
          "studentIds": Class.studenetIds,
    }
       })
    }
    }catch(error){
        res.satus(500).send("interal server error ")
    }

}

