<!--add Dimension !-->
<template>
<div>
<Header defaultval="2"/>
<div class="content-area">
  <!-- Delete Dimension-->
  <el-dialog
  title="Delete Dimension"
  :visible.sync="deleteDialog"
  width="30%"
  :before-close="handleClose">
  <span>Are you sure you want to delete this dimension?</span>
  <span slot="footer" class="dialog-footer">
    <el-button @click="deleteDialog = false">Cancel</el-button>
    <el-button type="primary" @click="deletedimension()">Confirm</el-button>
  </span>
</el-dialog>
<el-dialog title="Edit Domain" :visible.sync="editDimensionDialog">
  <el-form :model="dimension">
    <el-form-item label="Domain Name" :label-width="formLabelWidth">
      <el-input v-model="dimension.name" autocomplete="off"></el-input>
    </el-form-item>
    <el-form-item label="Domain Code" :label-width="formLabelWidth">
      <el-input v-model="dimension.code" autocomplete="off"></el-input>
    </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editDimensionDialog = false">Cancel</el-button>
    <el-button type="primary" @click="editdimension()">Confirm</el-button>
  </span>
</el-dialog>
<!-- Add Domain Dialog -->
<el-dialog title="Add Domain" :visible.sync="addDimensionDialog">
  <el-form :model="dimensionform">
    <el-form-item label="Domain Name" :label-width="formLabelWidth">
      <el-input v-model="dimensionform.name" autocomplete="off"></el-input>
    </el-form-item>
    <el-form-item label="Domain Code" :label-width="formLabelWidth">
      <el-input v-model="dimensionform.code" autocomplete="off"></el-input>
    </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button  @click="addDimensionDialog = false">Cancel</el-button>
    <el-button type="primary" @click="adddimension()">Confirm</el-button>
  </span>
</el-dialog>
 <el-table  height="337"
     v-loading="loading"
    element-loading-text="Loading..."
    element-loading-spinner="el-icon-loading"
   
    :default-sort = "{prop: 'name', order: 'descending'}"
    :data="tableData.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase())).slice(0,rowlimit)"
    style="width: 100%"
    :pagination.sync="pagination"
    >
    <el-table-column
      label="Domain Name"
      prop="name"
       sortable
      >
    </el-table-column>
    <el-table-column
      label="Domain Code"
      prop="code">
    </el-table-column>
    <el-table-column
      align="right">
      <template slot="header" slot-scope="scope">
        <el-input
          v-model="search"
          size="mini"
          placeholder="Search by Name"/>
      </template>
      <template slot-scope="scope" >
        <el-button
          size="mini"
          @click="doedit(scope.row.name,scope.row.code,scope.row._id)"><i class="el-icon-edit"></i></el-button>
        <el-button
          size="mini"
          @click="handledelete(scope.row._id)"><i class="el-icon-delete"></i></el-button>
      </template>
    </el-table-column>
  </el-table><br>
  <el-select v-model="rowlimit" placeholder="5" style="width:10%">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
  </el-select>
  <br>
  <el-button @click="addDimensionDialog = true" type="primary" icon="el-icon-plus" circle class="add-button"></el-button>
</div>

</div>
</template>

<script>
import Header from './Header'
  export default {
 mounted(){
   this.get()
   
 },
    computed: {  
},
    data() {
      return {
        pagination: {
   rowsPerPage: 5
},
      url:'',//url removed
      deleteDialog:false, 
          editDimensionDialog: false,
          addDimensionDialog:false,
      dimension: {
          name: '',
          code:'',
          id:''
        },
        dimensionform:{
          name: '',
          code:''
        },
        rowlimit:'5',
        formLabelWidth: '120px',
           editname:'',
          defaultval:'2,',
          del:{
            id:''
          },
      tableData: [],
      loading:true,
        search: '',
         options: [{
          value: '5',
          label: '5'
        }, {
          value: '10',
          label: '10'
        }, {
          value: '25',
          label: '25',
        },
         {
          value:'0',
          label: 'All',

        }
        ],
        value: ''
        
      }
    },
    methods: {
       get(){      
              this.loading=true      
              axios.get(this.url+'/dimension/all')
              .then(response =>{
                this.tableData = response.data.data;
                 this.loading=false
                var arraylength=this.tableData.length
                this.options[3].value=arraylength 
              })
              .catch(( {response} ) => {
                  this.$notify.error({
                  title: 'Error',
                  message: "Check network connection",
                  type: 'error'})             
              });             
          },    
          adddimension(){ 
              axios.post(this.url+'/dimension',this.dimensionform)
              .then(response =>{
                  this.$notify({
                  title: 'Success',
                  message: 'Domain Added Successfully',
                  type: 'success'
                });              
              this.get();
                this.addDimensionDialog=false
              }).catch(( {response} ) => {
                this.$notify.error({
                  title: 'Error',
                  message: response.data.msg,
                  type: 'error'})                
              });           
          },    
      handledelete(a) {
         this.deleteDialog=true;  
        this.del.id=a
      },
       handleClose(done) {
        this.$confirm('Are you sure to close this dialog?')
          .then(_ => {
            done();
          })
          .catch(_ => {});
      },
      doedit(a,b,c){
        this.editDimensionDialog=true
        this.dimension.name=a
        this.dimension.code=b
        this.dimension.id=c
      },
      editdimension(){
           axios.post(this.url+'/dimension/update',this.dimension)
              .then(response =>{
                  this.$notify({
                  title: 'Success',
                  message: 'Domain Updated Successfully',
                  type: 'success'
                });
                this.get();
                this.editDimensionDialog=false
              }).catch(( {response} ) => {
                this.$notify.error({
                  title: 'Error',
                  message: response.data.msg,
                  type: 'error'})                
              });
           
      },
      deletedimension(){
        axios.post(this.url+'/dimension/delete',this.del)
              .then(response =>{
                  this.$notify({
                  title: 'Success',
                  message: 'Domain Updated Successfully',
                  type: 'success'
                });
               this.get();
                this.deleteDialog = false
              
              }).catch(( {response} ) => {
                this.$notify.error({
                  title: 'Error',
                  message: response.data.msg,
                  type: 'error'})        
                  this.deleteDialog = false        
              });
      }
    },
    components:{
      'Header':Header,
    },
  }
</script>
<style>
.content-area{
  position:absolute;
  top:15%;
  left:20%;
  width:70%;
}
.add-button{
    position: absolute;
    left:95%;
}
</style>

