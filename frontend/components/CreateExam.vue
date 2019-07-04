<!--Create Exam Module -Group a set of selected tests to form an Exam . Add Instructions to each exam  !--> 
<template>
    <div>
        <Header defaultval="5"/> 
        <div class="content-area">
        <el-tabs v-model="editableTabsValue" type="card"  @edit="handleTabsEdit">
          <!--   Create Exam !-->
         <el-tab-pane label="Create Exam">
           <!-- Create Exam Dialog -->
        <el-dialog title="Create Exam" :visible.sync="createExamDialog">
          <el-form :model="form1">
            <el-form-item label="Exam Name" :label-width="formLabelWidth">
              <el-input v-model="examdata.examname" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="Formula" :label-width="formLabelWidth">
              <el-input v-model="examdata.formula" autocomplete="off"></el-input>
            </el-form-item>
            <label style="margin-right:10px">Select Domains </label>
            <el-select
              v-model="examdata.dimension"
              multiple
              filterable
               remote
              reserve-keyword
              placeholder="Please enter domain name"
              :remote-method="remoteMethod"
              :loading="loading">
              <el-option
                   v-for="item in dimensionOptions"
                  :key="item._id"
                  :label="item.name"
                  :value="item._id">
             </el-option>
            </el-select>
                          
            <el-table
                :data="examdata.instructions"
                 style="width: 100%">
            
           <el-table-column
                  prop="no"
                  label="Instruction No"
                   width="150">
            </el-table-column>
           <el-table-column
              prop="instruction"
               label="Instruction"
              width="350">
           </el-table-column>
           <el-table-column
             label="Action"
             width="100"
             >
              <template slot-scope="props">        
              <el-button
          size="mini"  @click="delinstruction(props.row)"><i class="el-icon-delete"></i></el-button></template>
           </el-table-column>
           </el-table><br>
            <el-button type="primary" @click="addInstructionDialog=true" icon="el-icon-plus" circle style="margin-left:80%"></el-button>
            <br><br>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="createExamDialog=false">Cancel</el-button>
            <el-button type="primary" @click="addexam()">Create</el-button>
          </span>
        </el-dialog> 
        <!-- Create Exam Dialog Ends Here!-->
        <!--Add Instruction Dialog !-->
        <el-dialog title="Create Test" :visible.sync="addInstructionDialog">
          <el-form :model="form1">
            <el-form-item label="Instruction No" :label-width="formLabelWidth">
              <el-input v-model="tempinstruction.no" type="number" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="Instruction" :label-width="formLabelWidth">
              <el-input v-model="tempinstruction.instruction" autocomplete="off"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addInstructionDialog=false">Cancel</el-button>
            <el-button type="primary" @click="addinstruction()">Add</el-button>
          </span>
        </el-dialog> 
        <!-- Add instruction dialog ends here!-->
             <el-button icon="el-icon-refresh-left" @click="resetDomainFilter">Reset domain filter</el-button>
           <el-select
              v-model="dimensionid.dimension"
              multiple
              filterable
               remote
              reserve-keyword
              placeholder="Please enter domain name"
              >
              <el-option
                   v-for="item in dimensionOptions"
                  :key="item._id"
                  :label="item.name"
                  :value="item._id">
             </el-option>
            </el-select>
             <el-button  icon="el-icon-search" type="primary" @click="searchdomain()"  circle></el-button>
  <el-table
    ref="multipleTable"
    :data="tableData"
    style="width: 100%"
    @selection-change="handleSelectionChange"
    >
    <el-table-column
      type="selection"
      width="55">
    </el-table-column>
    <el-table-column
      label="Date"
      prop="createdat"
      sortable
      width="180">
     
    </el-table-column>
    
    <el-table-column
      prop="testname"
      label="Test Name"
      width="180">
    </el-table-column>
    <el-table-column
      prop="dimension"
      label="Domains"
      width="180">
      <template slot-scope="scope">
       <el-tag style="margin-bottom:10px;margin-right:10px"
         :key="tag"
        v-for="tag in scope.row.dimension"
        :disable-transitions="false"
       >
        {{tag.name}}
</el-tag>
      </template>
    </el-table-column>
  </el-table><br><br>
   <el-button  icon="el-icon-success" @click="createExamDialog=true" type="primary" style="margin-left:300px">Create Exam</el-button>
           </el-tab-pane> 
           <!--View Exam Module-->
          <el-tab-pane label="View Exam">
          <el-table
    :data="exams"
    :default-sort = "{prop: 'createdat', order: 'descending'}"
    style="width: 100%">
    <el-table-column
      label="Date"
      prop="createdat"
      sortable
      width="180">
     
    </el-table-column>
    
    <el-table-column
      prop="examname"
      label="Test Name"
      width="180">
    </el-table-column>
    <el-table-column
      prop="dimension"
      label="Domains"
      width="180">
      <template slot-scope="scope">
       <el-tag style="margin-bottom:10px;margin-right:10px"
         :key="tag"
        v-for="tag in scope.row.dimension"
        :disable-transitions="false"
       >
        {{tag.name}}
</el-tag>
      </template>
    </el-table-column>
     <el-table-column
      label="Action"
      width="180">
      <el-button
          size="mini"
          @click="doansweredit(props.row._id,scope.row._id,scope.row.text,scope.row.mark)"><i class="el-icon-edit"></i></el-button>
        <el-button
          size="mini"
          @click="deleteanswer(props.row._id,scope.row._id)"><i class="el-icon-delete"></i></el-button>
    </el-table-column>
    
  </el-table>
  <!-- View Test Ends Here -->
          </el-tab-pane> 
</el-tabs>
    </div>
        </div>

</template>
<style>
.block1{
  position: relative;
  left: 0%;
  width:50%;
}
  .content-area{
  position:absolute;
  top:15%;
  left:20%;
  width:70%;
}

</style>
<script>
import Header from './Header'
  export default {
     mounted(){
    this.get()
 },
    components:{
      'Header':Header,
    },
  data() {
      return {
         url:'http://13.233.244.138',
        multipleSelection:[],
        testTableData:[
        ],
        tests:[],
        exams:[],
        examdata:{
            examname:'',
            tests:[],
            cover:'https://file.iviewui.com/dist/2ecd3b0452aa197097d5131afacab7b8.png',
            createdat:'',
            dimension:[],
            formula:'',
            instructions:[]
        },
        tempinstruction:
          {
            no:'',
            instruction:''
          }
        ,
        createExamDialog:false,
        addInstructionDialog:false,
         editableTabsValue: '0',
        editableTabs: [{
          title: 'Create Test',
          name: '1',
          content: 'Tab 1 content'
        }, {
          title: 'View Test',
          name: '2',
          content: 'Tab 2 content'
        }],
        tabIndex: 2,
        tableData: [],
        UnfilteredData:[],
        dimensionOptions:[],
        multipleSelection: [],
        value:'',
        dimensionid:[],
        dimensionid:{
        dimension:[]
      }
      }
    
    },
   methods: {
      get(){
              
               axios.get(this.url+'/dimension/all')
              .then(response =>{
                this.dimensionOptions = response.data.data;
              })
              .catch(( {response} ) => {
                this.$notify.error({
                  title: 'Error',
                  message: "Check network connection",
                  type: 'error'})
              });      
              axios.get(this.url+'/test/all')
              .then(response =>{
                this.tableData=response.data.data
              })
              .catch(( {response} ) => {
                this.$notify.error({
                  title: 'Error',
                  message: "Check network connection",
                  type: 'error'})
              });
               axios.get(this.url+'/exam/all')
              .then(response =>{
                this.exams=response.data.data
              })
              .catch(( {response} ) => {
                this.$notify.error({
                  title: 'Error',
                  message: "Check network connection",
                  type: 'error'})
              });
          },
        remoteMethod(query) {
        if (query !== '') {
          this.loading = true;
          setTimeout(() => {
            this.loading = false;
            this.dimensionOptions = this.dimensionOptions.filter(item => {
              return item.label.toLowerCase()
                .indexOf(query.toLowerCase()) > -1;
            });
          }, 200);
        } else {
          this.dimensionOptions = [];
        }
      },
      formatter(row, column) {
        return row.address;
      },
      searchdomain(){
         axios.post(this.url+'/test/dimension/in',this.dimensionid)
              .then(response =>{
                this.tableData = response.data.data;
              }).catch(( {response} ) => {
              this.$notify.error({
                  title: 'Error',
                  message: response.data.msg,
                  type: 'success'})
              });
      },
      toggleSelection(rows) {
        if (rows) {
          rows.forEach(row => {
            this.$refs.multipleTable.toggleRowSelection(row);
          });
        } else {
          this.$refs.multipleTable.clearSelection();
        }
      },
      handleSelectionChange(val) {     //Adding selected test's id to tests array 
        this.examdata.tests=[]
        this.multipleSelection = val;
        var arraylength=val.length
        for(var i=0;i<arraylength;i++){
            this.examdata.tests.push(val[i]._id)
        }
      },
      addinstruction(){             
        this.tempinstruction.no=parseInt(this.tempinstruction.no)
        this.examdata.instructions.push(this.tempinstruction)
        this.tempinstruction={}
        this.addInstructionDialog=false
      },
       delinstruction(a){
        this.examdata.instructions.pop(a)
      },
      addexam(){
         var d= new Date()
         this.examdata.createdat=d.toISOString().split('T')[0]
        axios.post(this.url+'/exam',this.examdata)
              .then(response =>{
                  this.$notify({
                  title: 'Success',
                  message: 'Exam Added Successfully',
                  type: 'success'
                });
                this.testdata={}
                this.get();
                this.createExamDialog=false
              }).catch(( {response} ) => {
                this.$notify.error({
                  title: 'Error',
                  message: response.data.msg,
                  type: 'success'})                
              });
      }
    }
  }
</script>